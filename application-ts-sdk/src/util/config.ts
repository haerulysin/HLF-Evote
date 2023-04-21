require("dotenv").config();

import * as env from "env-var";

export const ORG: string = env.get("ORG_NAME").default("SampleOrg").asString();
export const MSPID: string = env.get("MSP_ID").default("SampleOrg").asString();

export const loglevel: string = env
  .get("LOG_LEVEL")
  .default("info")
  .asEnum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);

export const port = env
  .get("PORT")
  .default("3000")
  .example("3000")
  .asPortNumber();

export const asLocalhost: boolean = env
  .get("AS_LOCAL_HOST")
  .default("true")
  .example("true")
  .asBoolStrict();

export const channelName: string = env
  .get("HLF_CHANNEL_NAME")
  .default("ch1")
  .asString();

export const chaincodeName: string = env
  .get("HLF_CHAINCODE_NAME")
  .default("mycc")
  .example("evote")
  .asString();

//Fabric-CA Config
export const fabricAdminUser: string = env
  .get("HLF_CA_ADMIN_USER")
  .default("admin")
  .asString();
export const fabricAdminPw: string = env
  .get("HLF_CA_ADMIN_PW")
  .default("adminpw")
  .asString();

export const fabricCAHostname: string = env
  .get("HLF_CA_HOSTNAME")
  .default("http://localhost:7054")
  .asString();
