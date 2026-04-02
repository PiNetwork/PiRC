class AnomalyDetector {
  constructor() {
    this.history = [];
    this.maxHistory = 50;
  }

  // simpan data snapshot
  addSample(sample) {
    this.history.push(sample);

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  // hitung rata-rata sederhana
  getAverage(key) {
    const values = this.history.map(h => h[key] || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    return values.length ? sum / values.length : 0;
  }

  // deteksi anomaly utama
  detect(sample) {
    this.addSample(sample);

    const ledgerAvg = this.getAverage("ledger");
    const txAvg = this.getAverage("txCount");

    let risk = "LOW";
    let score = 0;

    // 🔥 RULE 1: spike ledger
    if (sample.ledger > ledgerAvg * 1.8) {
      risk = "HIGH";
      score += 40;
    }

    // 🔥 RULE 2: spike transaksi
    if (sample.txCount > txAvg * 2) {
      risk = "HIGH";
      score += 40;
    }

    // 🔥 RULE 3: empty / freeze pattern
    if (sample.ledger === 0) {
      risk = "MEDIUM";
      score += 20;
    }

    // clamp score
    if (score > 100) score = 100;

    return {
      risk,
      score,
      ledgerAvg,
      txAvg,
      sample
    };
  }
}

export default new AnomalyDetector();
