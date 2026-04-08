import { BindingGenerator, GeneratedBindings, GenerateOptions } from "../bindings/generator";
import { RpcServer } from "../rpc/server";
export type GenerateAndWriteOptions = GenerateOptions & {
    outputDir: string;
    overwrite?: boolean;
};
/**
 * Source information about where the contract was fetched from
 */
export type ContractSource = {
    type: "file";
    path: string;
} | {
    type: "wasm-hash";
    hash: string;
    rpcUrl: string;
    network: string;
} | {
    type: "contract-id";
    contractId: string;
    rpcUrl: string;
    network: string;
};
export type CreateGeneratorArgs = {
    wasm?: string;
    wasmHash?: string;
    contractId?: string;
    rpcUrl?: string;
    networkPassphrase?: string;
    serverOptions?: RpcServer.Options;
};
export type CreateGeneratorResult = {
    generator: BindingGenerator;
    source: ContractSource;
};
/**
 * Create a BindingGenerator from local file, network hash, or contract ID
 */
export declare function createGenerator(args: CreateGeneratorArgs): Promise<CreateGeneratorResult>;
/**
 * Write generated bindings to disk
 */
export declare function writeBindings(outputDir: string, bindings: GeneratedBindings, overwrite: boolean): Promise<void>;
/**
 * Generate and write bindings to disk
 */
export declare function generateAndWrite(generator: BindingGenerator, options: GenerateAndWriteOptions): Promise<void>;
/**
 * Log source information
 */
export declare function logSourceInfo(source: ContractSource): void;
/**
 * Derive contract name from source path
 */
export declare function deriveContractName(source: ContractSource): string | null;
