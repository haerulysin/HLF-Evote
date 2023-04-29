/// <reference types="node" />
import { Wallet, Contract, Gateway, Network, Transaction } from 'fabric-network';
export declare const createWallet: (user: any) => Promise<Wallet>;
export declare const createGateway: (wallet: Wallet, identity: string) => Promise<Gateway>;
export declare const getNetwork: (gateway: Gateway) => Promise<Network>;
export declare const getContract: (network: Network) => Promise<{
    assetContract: Contract;
    qsccContract: Contract;
}>;
export declare function evaluateTransaction(contract: Contract, transactionName: string, ...transactionArgs: string[]): Promise<Buffer>;
export declare function submitTransaction(contract: Contract, transaction: Transaction, ...transactionArgs: string[]): Promise<Buffer>;
export declare const getTransactionValidationCode: (qsccContract: Contract, txid: string) => Promise<string>;
export declare const getBlockHeight: (qscc: Contract) => Promise<number | Long.Long>;
