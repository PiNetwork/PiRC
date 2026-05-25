export const tokenizePhysicalProduct = async (id, meta, owner) => {
    return { contractId: `PIRC-${id}`, txHash: "0x" + Math.random().toString(16).slice(2) };
};
