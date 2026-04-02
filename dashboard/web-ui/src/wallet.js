export async function connectWallet() {
  if (!window.freighterApi) {
    alert("Install Freighter Wallet");
    return null;
  }

  const publicKey = await window.freighterApi.getPublicKey();
  return publicKey;
}
