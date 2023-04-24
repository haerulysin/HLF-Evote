import express, { Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import * as config from "../util/config";
import { url } from "inspector";
import FabricCAServices from "fabric-ca-client";
import { Wallet, Wallets } from "fabric-network";
import { logger } from "../util/logger";
import { enrollUser, registerUser } from "../fabric.ca";
import { X509Certificate, createHash, createPrivateKey } from "crypto";
import { body, validationResult } from "express-validator";

import {
  createWallet,
  createGateway,
  getNetwork,
  GetContract,
  evaluateTransaction,
} from "../fabric";

export const authRouter = express.Router();

const testCert = (pub: string, prv: string): any => {
  const deCert = Buffer.from(pub, "base64").toString("ascii");
  try {
    new X509Certificate(deCert);
    return 200;
  } catch (err) {
    return err.message;
  }
};

authRouter.post(
  "/login",
  body().isObject().withMessage("Body must contain an asset object"),
  body("certificate", "must be a string").notEmpty(),
  body("privateKey", "must be a string").notEmpty(),
  async (req: Request, res: Response) => {
    //FORM FIELD VALIDATION
    const validation = validationResult(req);
    const publicCertPem = req.body.certificate;
    const prvKey = req.body.privateKey;
    if (!validation.isEmpty()) {
      return res.status(400).json({
        status: getReasonPhrase(400),
        reason: "VALIDATION_ERROR",
        message: "Invalid request body",
        timestamp: new Date().toISOString(),
        errors: validation.array(),
      });
    }

    const tcert = testCert(publicCertPem, prvKey);
    if (tcert !== 200) {
      return res.status(401).json({
        status: getReasonPhrase(401),
        reason: "Client ECERT wrong format",
        error: tcert,
        timestamp: new Date().toISOString(),
      });
    }
    try {
      const { uid, wallet } = await createWallet(publicCertPem, prvKey);

      // const certificate = Buffer.from(publicCertPem, "base64").toString(
      //   "ascii"
      // );
      // const privateKey = Buffer.from(prvKey, "base64").toString("ascii");
      // const wallet = {
      //   credentials: {
      //     certificate,
      //     privateKey,
      //   },
      //   type: "X.509",
      //   mspId: "SampleOrg",
      // };
      // const uid = createHash('sha256').update(JSON.stringify(wallet)).digest('hex')

      const gw = await createGateway(wallet, uid);
      const nw = await getNetwork(gw);
      const cc = await GetContract(nw);
      req.app.locals[`${uid}_Contract`] = cc;
      return res.status(200).json({
        status: getReasonPhrase(200),
        uid: uid,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        status: getReasonPhrase(500),
        reason: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

authRouter.post("/register", async (req: Request, res: Response) => {
  //ENROLL REGISTERED IDENTITIES
  const data = req.body;
  const datahash = createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");

  try {
    const enroll: any = await enrollUser(datahash);
    const pubCert = Buffer.from(enroll.certificate).toString("base64");
    const prvKey = Buffer.from(enroll.key.toBytes()).toString("base64");
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
