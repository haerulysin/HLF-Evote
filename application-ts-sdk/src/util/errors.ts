import { TimeoutError, TransactionError } from "fabric-network";
import { logger } from "./logger";

export const isErrorLike = (err: unknown): err is Error => {
  return (
    err != undefined &&
    err != null &&
    typeof (err as Error).name === "string" &&
    typeof (err as Error).message === "string" &&
    ((err as Error).stack === undefined ||
      typeof (err as Error).stack === "string")
  );
};

export class ContractError extends Error {
  txid: string;
  status: number;
  constructor(msg: string, txid: string, status: number) {
    super(msg);
    Object.setPrototypeOf(this, ContractError.prototype);
    this.name = "TransactionErrors";
    this.txid = txid;
    this.status = status;
  }
}

export class NeedAdminPrivilegeError extends ContractError {
  constructor(msg: string, txid: string, status: number) {
    super(msg, txid, status);
    Object.setPrototypeOf(this, NeedAdminPrivilegeError.prototype);
    this.name = "NeedAdminPrivilegeError";
  }
}

export class AssetNotExist extends ContractError {
  constructor(msg: string, txid: string, status: number) {
    super(msg, txid, status);
    Object.setPrototypeOf(this, AssetNotExist.prototype);
    this.name = "AssetNotExist";
  }
}

export class FunctionNotExist extends ContractError{
  constructor(msg:string, txid:string, status:number){
    super(msg,txid,status);
    Object.setPrototypeOf(this, FunctionNotExist.prototype);
    this.name = "FunctionNotExist"
  }
}

const matchNeedAdminPrivilege = (msg: string): string | null => {
  const messageMatch = msg.match(/Need Admin \w*/g);
  if (messageMatch !== null) {
    return messageMatch[0];
  }
  return null;
};

const MatchAssetNotExist = (msg: string): string | null => {
  const messageMatch = msg.match(/([tT]he )?[aA]sset \w* does not exist/g);
  if (messageMatch !== null) {
    return messageMatch[0];
  }
  return null;
};


const MatchFunctionNotExist = (msg:string):string|null=>{

  const messageMatch = msg.match(/You've asked to invoke a function that does not exist: \w*/g);
  if(messageMatch!==null){
    return messageMatch[0];
  }
  return null
}

export function handleError(txid: string, err: unknown): Error | unknown {
  if (isErrorLike(err)) {
    const needAdminMatch = matchNeedAdminPrivilege(err.message);
    if (matchNeedAdminPrivilege(err.message) !== null) {
      return new NeedAdminPrivilegeError(needAdminMatch, txid, 403);
    }

    const matchAssetNotExist = MatchAssetNotExist(err.message);
    if (matchAssetNotExist !== null) {
      return new AssetNotExist(matchAssetNotExist, txid, 404);
    }

    const matchFunctionNotExist = MatchFunctionNotExist(err.message);
    if(matchAssetNotExist!==null){
      return new FunctionNotExist(matchFunctionNotExist,txid,404)
    }
  }

  return new ContractError("Error",'',500)
}

export class FabricCAError extends Error {
  status: number;
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, FabricCAError.prototype);
    this.name = "FabricCAError";
    this.status = 401;
  }
}

export function handleFabricCAError(err: unknown): Error | unknown {
  if (isErrorLike(err)) {
    return new FabricCAError(err.message);
  }
  return err;
}
