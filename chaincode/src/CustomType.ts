export class Participant {
    public voterID: number;
    public voterRegisterID: number;
    public voterName: string;
    public type?: string;
}

export class Election {
    public electionID: string;
    public electionDescription:string;
    public electionDate:string;
    public type?:string;
}

export class Ballot {
    public ballotID:string;
    public electionID:string;
    public ballotVotableItem:any[];
    public isCasted:boolean;
    public isDeleted:boolean;
    public type?:string;
}

export class Candidates{
    public candidatesID:string;
    public candidatesName: string;
    public candidatesDescription:string;
}