import { createHash } from "crypto";



console.log(createHash('sha256').update((new Date).toString()).digest('hex'))