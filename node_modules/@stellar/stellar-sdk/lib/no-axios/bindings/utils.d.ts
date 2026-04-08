import { xdr } from "@stellar/stellar-base";
export declare function isNameReserved(name: string): boolean;
/**
 * Sanitize a name to avoid reserved keywords
 * @param identifier - The identifier to sanitize
 * @returns The sanitized identifier
 */
export declare function sanitizeIdentifier(identifier: string): string;
/**
 * Generate TypeScript type from XDR type definition
 */
export declare function parseTypeFromTypeDef(typeDef: xdr.ScSpecTypeDef, isFunctionInput?: boolean): string;
/**
 * Imports needed for generating bindings
 */
export interface BindingImports {
    /** Imports needed from type definitions */
    typeFileImports: Set<string>;
    /** Imports needed from the Stellar SDK in the contract namespace */
    stellarContractImports: Set<string>;
    /** Imports needed from Stellar SDK in the global namespace */
    stellarImports: Set<string>;
    /** Whether Buffer import is needed */
    needsBufferImport: boolean;
}
/**
 * Generate imports needed for a list of type definitions
 */
export declare function generateTypeImports(typeDefs: xdr.ScSpecTypeDef[]): BindingImports;
/**
 * Options for formatting imports
 */
export interface FormatImportsOptions {
    /** Whether to include imports from types.ts */
    includeTypeFileImports?: boolean;
    /** Additional imports needed from stellar/stellar-sdk/contract */
    additionalStellarContractImports?: string[];
    /** Additional imports needed from stellar/stellar-sdk */
    additionalStellarImports?: string[];
}
/**
 * Format imports into import statement strings
 */
export declare function formatImports(imports: BindingImports, options?: FormatImportsOptions): string;
/**
 * Format a comment string as JSDoc with proper escaping
 */
export declare function formatJSDocComment(comment: string, indentLevel?: number): string;
export declare function isTupleStruct(udtStruct: xdr.ScSpecUdtStructV0): boolean;
