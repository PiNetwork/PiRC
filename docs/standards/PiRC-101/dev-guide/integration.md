// Example: How a Merchant dApp interacts with PiRC-101 Vault
const ethers = require('ethers');

async function mintStableCredits(piAmount) {
    const vaultAddress = "0xYourVaultAddress";
    const abi = ["function depositAndMint(uint256 _amount, uint8 _class) external"];
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const vault = new ethers.Contract(vaultAddress, abi, signer);

    console.log("Expanding Pi into Sovereign Credits...");
    const tx = await vault.depositAndMint(ethers.utils.parseEther(piAmount), 0);
    await tx.wait();
    console.log("Success: Merchant now holds Stable REF Credits.");
}

