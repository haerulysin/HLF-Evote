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

        //Candidates
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

        //electionPut
        await ctx.stub.putState(
            electionData.electionID,
            Buffer.from(JSON.stringify(electionData))
        );

        //Generate Ballot
        const participantList = participantDataJson;
        for (const pvalue of participantList) {
            const pHash = this._toSha256(JSON.stringify(pvalue));
            const ballotID = {
                participantHash: pHash,
                electionID,
            };

            const ballotIDHash = this._toSha256(JSON.stringify(ballotID));
            await this._generateBallot(
                ctx,
                ballotIDHash,
                electionID,
                candidateTemp
            );
        }
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

        if (assetjson.docType === "Ballot") {
            const [OU, CN] = await this._getMemberDetail(ctx);
            const ballotPreHash = {
                participantHash: CN,
                electionID: assetjson.electionID,
            };
            const ballotHash = this._toSha256(JSON.stringify(ballotPreHash));
            if (ballotHash !== assetjson.ballotID) {
                throw new Error(
                    `You dont have access to read Ballot ${assetjson.ballotID}`
                );
            }
        }

        return JSON.stringify(assetjson);
    }

    @Param("pickedID", "string")
    @Param("electionID", "string")
    @Transaction(true)
    public async castVote(
        ctx: Context,
        pickedID: string,
        electionID: string
    ): Promise<any> {
        const [OU, CN] = await this._getMemberDetail(ctx);
        const ballotIDpreHash = {
            participantHash: CN,
            electionID,
        };

        const ballotID: string = this._toSha256(
            JSON.stringify(ballotIDpreHash)
        );

        if (!(await this._assetExist(ctx, ballotID))) {
            throw new Error(`Ballot doesnt exist`);
        }

        if (!(await this._assetExist(ctx, pickedID))) {
            throw new Error(`Candidates ${pickedID} doesnt exist`);
        }

        if (!(await this._assetExist(ctx, electionID))) {
            throw new Error(`Election ${electionID} doesnt exist`);
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
        await ctx.stub.setEvent("castVote", this.marshal(ballot));

        const response = {
            status: 200,
        };

        return JSON.stringify(response);
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

    @Param("assetID", "string")
    @Transaction()
    async GetAsset(ctx: Context, assetID: string): Promise<string> {
        if (!(await this._isAdmin(ctx, adminOU))) {
            throw new Error("Need Admin Privilege!");
        }

        return this.unmarshal(await ctx.stub.getState(assetID));
    }

    //priv function
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
        const startTime = Date.parse(election.electionDate.from);
        const endTime = Date.parse(election.electionDate.to);
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

    @Param('data','string')
    @Transaction(true)
    public async Add(ctx: Context, data:string): Promise<string> {
        const x = data;
        console.log(x)
        return "Add";
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
