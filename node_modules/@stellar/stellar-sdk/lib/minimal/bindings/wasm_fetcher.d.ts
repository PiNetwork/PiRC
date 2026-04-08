import { Server } from "../rpc";
/**
 * Types of contract data that can be fetched
 */
export type ContractData = {
    type: "wasm";
    wasmBytes: Buffer;
} | {
    type: "stellar-asset-contract";
};
/**
 * Errors that can occur during WASM fetching
 */
export declare class WasmFetchError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
/**
 * Fetch WASM from network using WASM hash
 */
export declare function fetchFromWasmHash(wasmHash: string, rpcServer: Server): Promise<ContractData>;
/**
 * Fetch WASM from network using contract ID
 */
export declare function fetchFromContractId(contractId: string, rpcServer: Server): Promise<ContractData>;
