# PiRC Architecture Overview

Dokumen ini menjelaskan arsitektur PiRC (Pi Requests for Comment) beserta modul-modul inti dan alur interaksi di ekosistem Pi Network.

---

## 1. PiRC Token (pi_token.rs)
- **Fungsi:** Mint-on-demand, distribusi token Pioneer, pengelolaan total supply.
- **Keamanan:** Menggunakan formal allocation invariants untuk mencegah over-minting.
- **Integrasi:** Terhubung ke Treasury Vault, Reward Engine, dan Liquidity Controller.

---

## 2. Treasury Vault (treasury_vault.rs)
- **Fungsi:** Menyimpan PiRC token cadangan, mengatur alokasi likuiditas dan dana protokol.
- **Fitur:** Akses terbatas untuk Governance Contract, monitoring saldo dan distribusi.
- **Integrasi:** Supply token ke DEX Executor, Reward Engine, dan Bootstrapper.

---

## 3. Governance Contract (governance.rs)
- **Fungsi:** Pengambilan keputusan on-chain untuk parameter protokol (misal reward rate, fee percentage, liquidity incentives).
- **Fitur:** Voting berbasis stake, upgradeability untuk kontrak PiRC.
- **Integrasi:** Mengontrol Treasury Vault, Reward Engine, dan Liquidity Controller.

---

## 4. Liquidity Controller (liquidity_controller.rs)
- **Fungsi:** Mengelola kontribusi likuiditas dari Pioneer dan LP eksternal.
- **Fitur:** Distribusi reward berbasis kontribusi, monitoring pair DEX.
- **Integrasi:** Terhubung ke DEX Executor, Reward Engine, dan Treasury Vault.

---

## 5. DEX Executor (dex_executor_a.rs & dex_executor_b.rs)
- **Fungsi:** Menyediakan mekanisme Free-Fault DEX untuk swap PiRC dan token lain.
- **Fitur:** Matching order, automated market making, fail-safe recovery.
- **Integrasi:** Terhubung ke Liquidity Controller dan Treasury Vault untuk eksekusi swap.

---

## 6. Reward Engine (reward_engine.rs)
- **Fungsi:** Mengelola distribusi reward bagi Pioneer, LP, dan peserta aktif ekosistem.
- **Fitur:** Deterministic reward allocation, sybil-resistant metrics, engagement oracle.
- **Integrasi:** Menarik token dari Treasury Vault dan PiRC Token, berinteraksi dengan Governance Contract.

---

## 7. Bootstrapper & GitHub Actions (bootstrap.rs + automation/)
- **Fungsi:** Setup awal kontrak dan lingkungan, jalankan simulasi ekonomi dan deployment otomatis.
- **Fitur:** Script untuk deploy semua kontrak PiRC, menjalankan agent-based simulations, monitoring reward loops.
- **Integrasi:** Memastikan loop ekonomi PiRC berjalan sejak genesis.

---

## Ekosistem Loop Ekonomi


- Loop ini memastikan **stabilitas ekonomi** dan **refleksivitas**.
- Token PiRC, Treasury Vault, Reward Engine, dan DEX Executor berinteraksi secara sinkron untuk menjaga ekosistem tetap sehat.

---

## Catatan
- Semua kontrak ditulis menggunakan **Rust (Soroban/Smart Contracts)**.
- Simulasi dan analisis ekonomi tersedia di folder `simulations/`.
- Dokumen ini akan diperbarui seiring **upgrade protokol dan kontrak baru**.
