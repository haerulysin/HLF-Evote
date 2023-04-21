import {
    Context,
    Contract,
    Param,
    Info,
    Returns,
    Transaction,
} from "fabric-contract-api";
import { Ballot, Election, Participant, Candidates } from "./data";
import { createHash } from "crypto";
import demoDataJson from "./datademo/demo.json";
import participantDataJson from "./datademo/participant.json";
import stringify from "json-stringify-deterministic";
import sortKeysRecursive from "sort-keys-recursive";
import { TextDecoder } from "util";

const utf8Decoder = new TextDecoder();
const adminOU = "admin";

@Info({
    title: "evoteContract",
    description: "Smart Contract for Electronic voting system",
})
export class EvoteContract extends Contract {
    constructor() {
        super("Electronic Voting Contract");
    }

    @Transaction()
    public async Init(ctx: Context): Promise<any> {
        if (!(await this._isAdmin(ctx, adminOU))) {
            throw new Error("Need Admin Privilege!");
        }
        return await ctx.clientIdentity.getID();
    }

    @Transaction()
    public async InitDemo(ctx: Context): Promise<void> {
        if (!(await this._isAdmin(ctx, adminOU))) {
            throw new Error("Need Admin Privilege!");
        }
        const electionJSON = demoDataJson.election;
        const candidateJSON = demoDataJson.Candidates;

        const electionID = this._toSha256(JSON.stringify(electionJSON));

        const electionData: Election = {
            electionID: electionID,
            ...electionJSON,
        };

        await ctx.stub.putState(
            electionData.electionID,
            Buffer.from(JSON.stringify(electionData))
        );
        let candidateTemp: any = [];

        for (const cjs of candidateJSON) {
            const cjID = this._toSha256(JSON.stringify(cjs));
            if (await this._assetExist(ctx, cjID)) {
                throw new Error(
                    `Asset ${cjs.docType} - ${cjs.candidatesName} exist`
                );
            }
            const candidatesData: Candidates = {
                candidatesID: cjID,
                ...cjs,
            };
            candidateTemp.push(JSON.parse(JSON.stringify(candidatesData)));
            await ctx.stub.putState(
                cjID,
                Buffer.from(JSON.stringify(candidatesData))
            );
        }

        //Generate Ballot
        const participantList = participantDataJson;
        for (const pvalue of participantList) {
            const participant: Participant = {
                electionID: electionID,
                ...pvalue,
            };
            const ballotID = this._toSha256(JSON.stringify(participant));
            await this._generateBallot(
                ctx,
                ballotID,
                electionID,
                candidateTemp
            );
        }
    }

    @Param("pickedID", "string")
    @Transaction()
    public async castVote(ctx: Context, pickedID: string): Promise<any> {
        const [OU, CN] = await this._getMemberDetail(ctx);
        const ballotID = CN;
        if (!await this._assetExist(ctx, ballotID)) {
            throw new Error(`Assets ${ballotID} doenst exist`);
        }

        const ballotjson = this.unmarshal(await ctx.stub.getState(ballotID));
        this._checkBallot(ballotjson);
        const ballot: Ballot = { pick: pickedID, ...ballotjson };
        ballot.isCasted = true;
        const electionjson = this.unmarshal(
            await ctx.stub.getState(ballot.electionID)
        );
        this._checkElections(electionjson);
        await ctx.stub.putState(ballotID, this.marshal(ballot));
    }

    @Transaction(false)
    public async GetAllAsset(ctx: Context): Promise<any> {
        if (!(await this._isAdmin(ctx, adminOU))) {
            throw new Error("Need Admin Privilege!");
        }
        const allResult = [];
        const it = ctx.stub.getStateByRange("", "");
        return this._getResult(it);
    }

    @Param("assetID", "string")
    @Transaction(false)
    public async ReadAsset(ctx: Context, assetID: string): Promise<string> {
        if (!(await this._assetExist(ctx, assetID))) {
            throw new Error(`The asset ${assetID} does not exist`);
        }
        const assetjson = this.unmarshal(await ctx.stub.getState(assetID));
        return JSON.stringify(assetjson);
    }

    @Transaction(false)
    public async GetElectionList(ctx: Context): Promise<string> {
        let query = { selector: { docType: "Election" } };
        const it = ctx.stub.getQueryResult(JSON.stringify(query));
        return this._getResult(it);
    }

    @Param("docType", "string")
    @Transaction()
    async GetByDocType(ctx: Context, docType: string): Promise<any> {
        if (!(await this._isAdmin(ctx, adminOU))) {
            throw new Error("Need Admin Privilege!");
        }
        let query = { selector: { docType: docType } };
        const it = ctx.stub.getQueryResult(JSON.stringify(query));
        return this._getResult(it);
    }

    @Transaction(false)
    public async msptest(ctx: Context): Promise<any> {
        return await ctx.clientIdentity.getID();
    }

    //helpers
    async _generateBallot(
        ctx: Context,
        ballotID: string,
        electionID: string,
        ballotVotableItem: any[]
    ): Promise<void> {
        const ballot: Ballot = {
            ballotID: ballotID,
            electionID: electionID,
            ballotVotableItem: ballotVotableItem,
            isCasted: false,
            isDeleted: false,
            docType: "Ballot",
        };
        if (await this._assetExist(ctx, ballotID)) {
            throw new Error(`Assets ${ballot.docType} - ${ballotID} is exist`);
        }
        await ctx.stub.putState(ballotID, Buffer.from(JSON.stringify(ballot)));
    }

    async _assetExist(ctx: Context, assetID: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(assetID);
        return !!buffer && buffer.length > 0;
    }

    async _getResult(promiseOfIterator: any): Promise<string> {
        const allResult = [];
        for await (const res of promiseOfIterator) {
            allResult.push(JSON.parse(res.value.toString()));
        }
        return JSON.stringify(allResult);
    }

    async _isAdmin(ctx: Context, orgUnit: string): Promise<boolean> {
        const [OU, CN] = await this._getMemberDetail(ctx);
        // return OU;
        return orgUnit == OU;
    }

    async _checkCertName(ctx: Context, certName: string): Promise<boolean> {
        const [OU, CN] = await this._getMemberDetail(ctx);
        return certName == CN;
    }

    async _getMemberDetail(ctx: Context): Promise<any> {
        let certSubjectList: { [index: string]: string } = {};
        const x509id: string = await ctx.clientIdentity.getID();
        const certSubject: string = x509id.split("::")[1];
        const certSubjectArray: string[] = certSubject.split("/");
        for (const cs of certSubjectArray) {
            const csArr: string[] = cs.split("=");
            if (!csArr[1]) {
                continue;
            }
            certSubjectList[csArr[0]] = csArr[1];
        }
        return [certSubjectList.OU, certSubjectList.CN];
    }

    _checkBallot(ballot: Ballot) {
        if (ballot.isCasted || ballot.pick) {
            throw new Error(`Ballot ${ballot.ballotID} was casted`);
        }

        if (ballot.isDeleted) {
            throw new Error(`Ballot ${ballot.ballotID} was deleted`);
        }
    }

    _checkElections(election: Election) {
        const currTime = Date.parse(new Date().toString());
        const electionTime = election.electionDate.split(" ");
        const startTime = Date.parse(electionTime[0]);
        const endTime = Date.parse(electionTime[1]);

        if (!(currTime >= startTime && currTime <= endTime)) {
            throw new Error(`The ${election.electionName} not open for now!`);
        }
    }

    _toSha256(strval: string | object) {
        if (typeof strval === "object") {
            strval = JSON.stringify(this._toSha256);
        }
        return createHash("sha256").update(strval).digest("hex");
    }

    marshal(o: object): Buffer {
        return Buffer.from(stringify(sortKeysRecursive(o)));
    }

    unmarshal(bytes: Uint8Array | string): object | any {
        const json =
            typeof bytes === "string" ? bytes : utf8Decoder.decode(bytes);
        const parsed: unknown = JSON.parse(json);
        if (parsed == null || typeof parsed !== "object") {
            throw new Error(`Invalid JSON type (${typeof parsed}): ${json}`);
        }
        return parsed;
    }

    //Dev-mode
    @Transaction()
    async DeleteAllAsset(ctx: Context): Promise<void> {
        if (!(await this._isAdmin(ctx, adminOU))) {
            throw new Error("Need Admin Privilege!");
        }
        const it = ctx.stub.getStateByRange("", "");
        for await (const res of it) {
            await ctx.stub.deleteState(res.key);
        }
    }

    public async reset(ctx: Context): Promise<void> {
        await this.DeleteAllAsset(ctx);
        console.log("All Asset Deleted");
        // await this.DeleteAllPrivateData(ctx);
        // console.log("All Priv Data Deleted");
    }

    async DeleteAllPrivateData(ctx: Context): Promise<void> {
        const it = ctx.stub.getPrivateDataByRange("userDataCollection", "", "");
        for await (const res of it) {
            await ctx.stub.deletePrivateData("userDataCollection", res.key);
        }
    }

    async GetAllPrivateData(ctx: Context): Promise<string> {
        const it = ctx.stub.getPrivateDataByRange("userDataCollection", "", "");
        return this._getResult(it);
    }
}
