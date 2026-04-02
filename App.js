import React, { useState } from "react";
import { connectWallet, signMessage } from "./wallet";

function App() {
  const [wallet, setWallet] = useState(null);
  const [result, setResult] = useState(null);

  const handleConnect = async () => {
    const addr = await connectWallet();
    setWallet(addr);
  };

  const sendData = async () => {
    if (!wallet) {
      alert("Connect wallet first");
      return;
    }

    const user = {
      attention: Math.random() * 10,
      quality: Math.random(),
      behavior: Math.random(),
      session_time: Math.random() * 10,
      interaction_rate: Math.random() * 5,
    };

    const message = JSON.stringify(user);
    const signature = await signMessage(message);

    const res = await fetch("http://localhost:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
        address: wallet,
        signature
      }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>PiRC-AI Wallet Dashboard</h1>

      {!wallet ? (
        <button onClick={handleConnect}>
          Connect Wallet
        </button>
      ) : (
        <p>Wallet: {wallet}</p>
      )}

      <button onClick={sendData}>
        Generate Attention
      </button>

      {result && (
        <div>
          <p>Verification: {result.verification.toFixed(3)}</p>
          <p>Reward: {result.reward.toFixed(3)}</p>
          <p>Balance: {result.balance.toFixed(3)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
