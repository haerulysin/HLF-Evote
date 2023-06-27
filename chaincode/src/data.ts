import { Object, Property } from "fabric-contract-api";
Object();
export class Election {
    @Property("electionID", "string")
    electionID = "";
    @Property("electionName", "string")
    electionName = "";
    @Property("electionLocation", "string")
    electionLocation = "";
    @Property("electionDate", "string[]")
    electionDate = { from: "", to: "" };
    @Property("electionShowResult", "boolean")
    electionShowResult = false;
    @Property("owner", "string")
    owner? = "";
    @Property("docType", "string")
    docType = "Election";
}

Object();
export class Participant {
    @Property("voterID", "number")
    voterID = 0;
    @Property("voterRegisterID", "number")
    voterRegisterID = 0;
    @Property("voterName", "string")
    voterName = "";
    @Property("electionID", "string")
    electionID = "";
    @Property("docType", "Participant")
    docType? = "";
}

Object();
export class Ballot {
    @Property("ballotID", "string")
    ballotID = "";
    @Property("electionID", "string")
    electionID = "";
    @Property("owner", "string")
    owner = "";
    @Property("pick", "string")
    pick? = "";
    @Property("isCasted", "boolean")
    isCasted = false;
    @Property("isDeleted", "boolean")
    isDeleted = false;
    @Property("docType", "string")
    docType = "";
}

Object();
export class Candidates {
    @Property("candidatesID", "string")
    candidatesID = "";
    @Property("electionID", "string")
    electionID = "";
    @Property("candidatesName", "string")
    candidatesName = "";
    @Property("candidatesDescription", "string")
    candidatesDescription = "";
    @Property("candidatesPhotoURL", "string")
    candidatesPhotoURL? =
        "https://res.cloudinary.com/mdkruls/image/upload/v1683870802/candidatesPhoto/Default_pfp.svg_noyjas.png";
    @Property("docType", "string")
    docType = "Candidate";
}

Object();
export class CCResponse {
    @Property("status", "number")
    status? = 0;
    @Property("error", "string")
    error? = "";
}
