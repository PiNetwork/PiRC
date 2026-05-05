// GOVERNANCE VOTING — Transparency & Fairness
function castVote(proposalId, vote) {
  console.log(`Vote cast: Proposal ${proposalId} → ${vote}`);
  alert(`Vote recorded on Vanguard Bridge (Proposal ${proposalId})`);
}

const proposals = [
  { id: 207, title: "CEX Liquidity Entry Rule", status: "Active" },
  { id: 208, title: "314 System Stabilization", status: "Active" }
];
