import express, { Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { logger } from "../util/logger";
import { json } from "stream/consumers";
import { Contract } from "fabric-network";
import { evaluateTransaction } from "../fabric";

export const electionRouter = express.Router();
export const ballotRouter = express.Router();
export const assetRouter = express.Router();

electionRouter.get("/", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`]?.assetContract;
    const data = await evaluateTransaction(contract, "GetElectionList");
    let asset = [];
    if (data.length > 0) {
      asset = JSON.parse(data.toString());
    } else {
      return res.status(404).json({
        status: getReasonPhrase(404),
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(200).json(asset);
  } catch (err) {
    return res.status(err.status).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

electionRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`].assetContract;
    const data = await evaluateTransaction(
      contract,
      "ReadAsset",
      req.params.id
    );
    return res.status(200).json(JSON.parse(data.toString()));
  } catch (err) {
    return res.status(200).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      tx: err.txid,
      timestamp: new Date().toISOString(),
    });
  }
});

ballotRouter.get("/:ballotid", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`].assetContract;
    const data = await evaluateTransaction(
      contract,
      "ReadAsset",
      req.params.ballotid
    );
    return res.status(200).json(JSON.parse(data.toString()));
  } catch (err) {
    return res.status(200).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      tx: err.txid,
      timestamp: new Date().toISOString(),
    });
  }
});

assetRouter.get("/", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`].assetContract;
    const data = await evaluateTransaction(contract, "GetAllAsset");
    let asset = [];
    if (data.length > 0) {
      asset = JSON.parse(data.toString());
    } else {
      return res.status(404).json({
        status: getReasonPhrase(404),
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json(asset);
  } catch (err) {
    return res.status(err.status).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});
