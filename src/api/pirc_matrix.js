module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 7-Layer Contract Configuration
  res.status(200).json({
    "ENVIRONMENT": "production",
    "NETWORK": "testnet", 
    "MAINNET_READY": true,
    "CONTRACT_ADDRESSES": {
      "PIRC_CORE": "C84B73B250F43EF0316A99A27F3841D6B4E5FEA3535B2AFB8CFA8",
      "PIRC_GAS": "CB8E009B82FF84E481D0DCF25DAB6F4A81E9AEE973EA3BEE1F14A",
      "PIRC_GOV": "CB055106BE81CDE13A7DA1648E3BD7ECC9A588147E02DE9D2B5BC",
      "PIRC_SHIELD": "C34A92B45A9F0D904A26C4DE31D4AFB75D4E88E52A7BCF69324AB",
      "PIRC_DATA": "CAF48B257CD5BE33D6ED60183DBAF1A5A24CA0B77D2EA90C5BFE3",
      "PIRC_NODE": "CAD820B10C4DE390B7CD81B6D4586CBEB7073AF6A8205C90A1AD8",
      "PIRC_QUANTUM": "CC129C0BE5AD487D43E31A2FB621D3BE1BF49D0CD2A2EB5DCCD5"
    },
    "PI_DAPP_PORTAL": {
      "appName": "PiRC",
      "appUrl": "https://pi-rc.vercel.app/",
      "isTestnet": true
    }
  });
};
