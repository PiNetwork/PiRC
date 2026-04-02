import React, { useState } from "react";

function App() {
  const [result, setResult] = useState(null);

  const sendData = async () => {
    const user = {
      attention: Math.random() * 10,
      quality: Math.random(),
      behavior: Math.random(),
      session_time: Math.random() * 10,
      interaction_rate: Math.random() * 5,
    };

    const res = await fetch("http://localhost:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        address: "USER_1",
      }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>PiRC-AI Live Dashboard</h1>

      <button onClick={sendData}>
        Generate Attention
      </button>

      {result && (
        <div>
          <p>Verification: {result.verification.toFixed(3)}</p>
          <p>Reward: {result.reward.toFixed(3)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
