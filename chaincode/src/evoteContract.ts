import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Ballot, Election, Participant } from './CustomType';
import { createHash } from 'crypto';

export class EvoteContract extends Contract {
    constructor() {
        super();
    }

    @Transaction()
    public async Init(ctx: Context, participantList: string = null): Promise<any> {
        if (!await this._checkOrgUnit(ctx, "admin")) {
            throw new Error("Need Admin Privilege!");
        }
        return "Init Success";
    }

    @Transaction()
    public async InitDemo(ctx: Context): Promise<void> {
        if (!await this._checkOrgUnit(ctx, "admin")) {
            throw new Error("Need Admin Privilege!");
        }
    }


    // async generateBallot(ctx:Context){
    //     const ballot:Ballot={
    //         ballotID:"",
    //         electionID:
    //     }
    // }

    public async ReadAsset(ctx: Context, voterID: number) {
        const participantJson = await ctx.stub.getState(voterID.toString());
        if (!participantJson || participantJson.length === 0) {
            throw new Error(`The asset ${voterID} does not exist`);
        }
        return participantJson.toString();
    }

    public async GetAllAsset(ctx: Context): Promise<any> {
        const allResult = [];
        const it = ctx.stub.getStateByRange('', '');
        return this._getResult(it);
    }

    public async getQuery(ctx: Context): Promise<any> {
        let query = {
            selector: {
                type: "Participant",
                voterRegisterID: 9561660263
            }
        }

        const it = ctx.stub.getPrivateDataQueryResult("userDataCollection", JSON.stringify(query));
        return this._getResult(it);

    }


    async _getResult(promiseOfIterator: any): Promise<string> {
        const allResult = [];
        for await (const res of promiseOfIterator) {
            allResult.push(JSON.parse(res.value.toString()))
        }
        return JSON.stringify(allResult);
    }

    async _checkOrgUnit(ctx: Context, orgUnit: string): Promise<boolean> {
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
            if (!csArr[1]) { continue; }
            certSubjectList[csArr[0]] = csArr[1];
        }
        return [certSubjectList.OU, certSubjectList.CN];
    }


    //Dev-mode

    public async test(ctx: Context): Promise<string> {
        const ms: string = await ctx.clientIdentity.getID();
        return createHash('sha256').update(ms).digest('hex');
    }

    public async reset(ctx: Context): Promise<void> {
        await this.DeleteAllAsset(ctx);
        console.log("All Asset Deleted");
        await this.DeleteAllPrivateData(ctx);
        console.log("All Priv Data Deleted");
    }

    async DeleteAllAsset(ctx: Context): Promise<void> {
        const it = ctx.stub.getStateByRange('', '');
        for await (const res of it) {
            await ctx.stub.deleteState(res.key);
        }
    }

    async DeleteAllPrivateData(ctx: Context): Promise<void> {
        const it = ctx.stub.getPrivateDataByRange('userDataCollection', '', '')
        for await (const res of it) {
            await ctx.stub.deletePrivateData('userDataCollection', res.key);
        }
    }
    async GetAllPrivateData(ctx: Context): Promise<string> {
        const it = ctx.stub.getPrivateDataByRange('userDataCollection', '', '');
        return this._getResult(it);
    }
}