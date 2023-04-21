import express, { Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import * as config from "../util/config";
import { url } from "inspector";
import FabricCAServices from "fabric-ca-client";
import { Wallet, Wallets } from "fabric-network";
import { logger } from "../util/logger";
import { enrollUser, registerUser } from "../fabric.ca";
import { createHash } from "crypto";
import {
  createWallet,
  createGateway,
  getNetwork,
  getContract,
  evaluateTransaction,
} from "../fabric";

export const authRouter = express.Router();



authRouter.post("/register", async (req: Request, res: Response) => {
  //ENROLL CURRENT IDENTITIES
  const data = req.body;
  const datahash = createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");

  try {
    const enroll: any = await enrollUser(datahash);
    const prvKey = enroll.key.toBytes().replace(/\r\n/g, "\n");
    const pubCert = enroll.certificate.replace(/\r\n/g, "\n");
    return res.status(200).json({
      certificate: pubCert,
      privateKey: prvKey,
    });
  } catch (err) {
    return res.status(err.status).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      timestamp: new Date().toISOString,
    });
  }
});
