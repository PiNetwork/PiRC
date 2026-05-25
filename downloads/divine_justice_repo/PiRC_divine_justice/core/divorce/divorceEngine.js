export function divorceEngine(data) {
  const { assets, religion } = data;
  if (religion === "islam") {
    return islamicDivorce(data);
  }
  return equalSplit(assets);
}

function islamicDivorce(data) {
  const { assets, mahrPaid } = data;
  return {
    wife: mahrPaid ? assets * 0.5 : assets * 0.6,
    husband: mahrPaid ? assets * 0.5 : assets * 0.4
  };
}

function equalSplit(assets) {
  return { wife: assets * 0.5, husband: assets * 0.5 };
}
