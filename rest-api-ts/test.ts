const message = "No valid responses from any peers. Errors:    peer=localhost, status=500, message=Assets defbda1533569d2127df931c5e417c55974ac6ee028927ace840896b5f0e7593 doenst exist";
const errMsg = message.match(/(message=)(.*)/)![2]

console.log(errMsg);