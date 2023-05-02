import { createHash } from "crypto";
const userInfo = {
    "voterID": "4143234751",
    "voterRegisterID": "7193726672",
    "voterName": "Gilmore",
    "docType": "Participant"
};
const userInfoHash = createHash('sha256').update(JSON.stringify(userInfo)).digest('hex')
console.log(userInfoHash);
const ballotPreHash = {
    participantHash: userInfoHash,
    electionID: 'f8f0c97394ea4399aa98b10ffec5dfd5a4d5c5f5dbfce7f64a1d6469f1e0ebd9'
}

const ballotHash = createHash('sha256').update(JSON.stringify(ballotPreHash)).digest('hex');

console.log(ballotHash)
