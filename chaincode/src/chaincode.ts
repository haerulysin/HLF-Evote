import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import participantData from './data/generated_participant.json';
import { Participant } from './Participant';
import { stringify } from 'querystring';
import sortKeysRecursive from 'sort-keys-recursive';

export class Chaincode extends Contract {
    constructor() {
        super();
    }

    public async Init(ctx: Context, participantList:string=null): Promise<any> {
        if(participantList!=null){
            return `Custom Participant initiliazed`;
        }

        //JSON Participant Generate
        const participant:Participant[] = participantData;
        for(const p of participant){
            p.type = "Participant";
            await ctx.stub.putState(p.voterID.toString(),Buffer.from(JSON.stringify(p)));
            console.info(`Participant ${p.voterName} added`);
        }

        return `Default Participant Initiliazed`;
    }

    public async ReadAsset(ctx:Context, voterID:number){
        const participantJson = await ctx.stub.getState(voterID.toString());
        if (!participantJson || participantJson.length === 0) {
            throw new Error(`The asset ${voterID} does not exist`);
        }
        return participantJson.toString();
    }

    public async GetAllAsset(ctx:Context):Promise<any>{
        const allResult = [];
        const it = ctx.stub.getStateByRange('','');
        for await(const res of it){
            const strValue = Buffer.from(res.value.toString()).toString('utf-8');
            let rec;
            try{
                rec = JSON.parse(strValue);
            }catch(err){
                console.log(err);
                rec=strValue;
            }
            allResult.push(rec);
        }
        return JSON.stringify(allResult);
    }



    //Dev-mode for delete all asset
    async DeleteAllAsset(ctx:Context):Promise<string>{
        const allKey = [];
        const it = await ctx.stub.getStateByRange('','');
        let res = await it.next();
        while(!res.done){
            let keyVal = Buffer.from(res.value.key).toString('utf-8');
            await ctx.stub.deleteState(keyVal);
            res = await it.next();
        }
        return "All Assets Deleted";
    }
}
