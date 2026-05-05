import { tokenizePhysicalProduct } from '../sdk/luxamir_rwa_sdk.js';

const APP_ID = "luxamir-prod-2026";
const PRODUCT_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const METADATA = { name: "Luxamir Premium Leather Bag", serial_number: "LUX-2026-001234" };
const OWNER_ADDRESS = "GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const PROOF = new Uint8Array([]);

async function main() {
    const txHash = await tokenizePhysicalProduct(APP_ID, PRODUCT_HASH, METADATA, OWNER_ADDRESS, PROOF);
    console.log("🎉 Success! Transaction Hash:", txHash);
}
main();
