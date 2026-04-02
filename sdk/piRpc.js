import fetch from "node-fetch";

export default class PiRPC {
  constructor(url = "https://rpc.testnet.minepi.com") {
    this.url = url;
  }

  async call(method, params = []) {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    };

    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    return await res.json();
  }

  getNetwork() {
    return this.call("getNetwork");
  }

  getHealth() {
    return this.call("getHealth");
  }

  getVersionInfo() {
    return this.call("getVersionInfo");
  }
}
