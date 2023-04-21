import express, { Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { logger } from "../util/logger";
import { json } from "stream/consumers";
import { Contract } from "fabric-network";
import { evaluateTransaction } from "../fabric";

const {
  ACCEPTED,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} = StatusCodes;
const assetRouter = express.Router();

//devcontract;
const devcontract =
  "9e7df9ada018481af4ee5cbf604c8bc85f3d6145275eaa14e11675371c304e9b";

assetRouter.get("/", async (req: Request, res: Response) => {
  try {
    const contract: Contract = req.app.locals[`${devcontract}_Contract`].assetContract;
    const data = await evaluateTransaction(contract, "GetElectionList");
    let asset = [];
    if (data.length > 0) {
      asset = JSON.parse(data.toString());
    }
    return res.status(OK).json(asset);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: getReasonPhrase(500),
      timestamp: new Date().toISOString(),
    });
  }
});

assetRouter.get("/:assetID", async (req: Request, res: Response) => {
  const assetID = req.params.assetID;
  try {
    const contract: Contract = req.app.locals[devcontract].assetContract;
    const data = await evaluateTransaction(contract, "ReadAsset", assetID);
    return res.status(OK).json(JSON.parse(data.toString()));
  } catch (err) {
    return res.status(err.status).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      tx: err.txid,
      timestamp: new Date().toISOString(),
    });
  }
});

export { assetRouter };
