/**
 * Obtains the contract spec XDR from a contract's wasm binary.
 * @param wasm The contract's wasm binary as a Buffer.
 * @returns The XDR buffer representing the contract spec.
 * @throws {Error} If the contract spec cannot be obtained from the provided wasm binary.
 */
export declare function specFromWasm(wasm: Buffer): Buffer;
