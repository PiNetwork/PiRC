import { Spec } from "../contract";
/**
 * Interface for struct fields
 */
export interface StructField {
    doc: string;
    name: string;
    type: string;
}
/**
 * Interface for union cases
 */
export interface UnionCase {
    doc: string;
    name: string;
    types: string[];
}
/**
 * Interface for enum cases
 */
export interface EnumCase {
    doc: string;
    name: string;
    value: number;
}
/**
 * Generates TypeScript type definitions from Stellar contract specs
 */
export declare class TypeGenerator {
    private spec;
    constructor(spec: Spec);
    /**
     * Generate all TypeScript type definitions
     */
    generate(): string;
    /**
     * Generate TypeScript for a single spec entry
     */
    private generateEntry;
    private generateImports;
    /**
     * Generate TypeScript interface for a struct
     */
    private generateStruct;
    /**
     * Generate TypeScript union type
     */
    private generateUnion;
    /**
     * Generate TypeScript enum
     */
    private generateEnum;
    /**
     * Generate TypeScript error enum
     */
    private generateErrorEnum;
    /**
     * Generate union case
     */
    private generateUnionCase;
    /**
     * Generate enum case
     */
    private generateEnumCase;
    private generateTupleStruct;
}
