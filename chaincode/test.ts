const orid =
    "x509::/C=ID/ST=Central Java/L=Banyumas/O=evote.example.com/OU=admin/OU=evote/CN=admin::/C=ID/ST=Central Java/L=Banyumas/O=evote.example.com/OU=evote/CN=ca.evote.example.com";
const clientSubject = orid.split("::")[1];
const issuerSubject: string[] = orid.split("::")[2].split("/");
let issuerOU!: string;

issuerSubject.forEach(r => {
    const sKey = r.split("=");
    if (sKey[0] == "OU"){
        issuerOU=sKey[1];
    }
    
});

console.log(issuerOU);
