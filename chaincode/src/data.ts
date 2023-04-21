import { Object as DatadocType, Property } from 'fabric-contract-api';

@DatadocType()
export class Participant {
    @Property('voterID', 'number')
    voterID = 0;
    @Property('voterRegisterID', 'number')
    voterRegisterID = 0;
    @Property('voterName', 'string')
    voterName = '';
    @Property('electionID', 'string')
    electionID = '';
    @Property('docType', 'Participant')
    docType?= '';
}

export class Election {
    @Property('electionID', 'string')
    electionID = '';
    @Property('electionName', 'string')
    electionName = '';
    @Property('electionLocation', 'string')
    electionLocation = '';
    @Property('electionDate', 'string')
    electionDate = '';
    @Property('electionShowResult', 'boolean')
    electionShowResult = false;
    @Property('owner','string')
    owner?='';
    @Property('docType', 'string')
    docType = 'Election';

}

export class Ballot {
    @Property('ballotID', 'string')
    ballotID = '';
    @Property('electionID', 'string')
    electionID = '';
    @Property('ballotVotableItem', 'any[]')
    ballotVotableItem = {};
    @Property('pick', 'string')
    pick? = '';
    @Property('isCasted', 'boolean')
    isCasted = false;
    @Property('isDeleted', 'boolean')
    isDeleted = false;
    @Property('docType', 'string')
    docType = '';
}

export class Candidates {
    @Property('candidatesID', 'string')
    candidatesID = '';
    @Property('candidatesName', 'string')
    candidatesName = '';
    @Property('candidatesDescription', 'string')
    candidatesDescription = '';
    @Property('docType', 'string')
    docType = "Candidates";
}

