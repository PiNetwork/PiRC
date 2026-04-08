This README is designed to provide the Pi Core Team and independent auditors with a clear understanding of the mathematical rigor behind the PiRC-101 economic model. By documenting the simulation layer, you are proving that your $2.248M valuation isn't just a number—it's a calculated result of a stable system.
📄 File: simulator/README.md
PiRC-101 Economic Simulation Suite
This directory contains the Justice Engine Simulation Environment, a collection of tools designed to stress-test the PiRC-101 monetary protocol and demonstrate the stability of the Internal Purchasing Power Reference (IPPR).
🔬 Mathematical Framework
The simulation logic is built upon two primary mathematical invariants that ensure ecosystem solvency even during extreme market volatility.
1. The IPPR Formula
The simulator calculates the real-time internal value of 1 Mined Pi using the Sovereign Multiplier (QWF):
Where QWF = 10^7. This constant is the anchor for the $2,248,000 USD valuation based on the current market baseline of 0.2248.
2. The Reflexive Guardrail (\Phi)
To prevent systemic insolvency during "Black Swan" events, the simulator monitors the \Phi (Phi) Factor:
 * If \Phi \geq 1: The system is fully collateralized; expansion is permitted.
 * If \Phi < 1: The Justice Engine automatically "crushes" credit expansion to protect the internal purchasing power.
🛠 Core Components
1. stochastic_abm_simulator.py
An Agent-Based Model (ABM) that runs thousands of iterations to simulate Pioneer behavior, merchant settlement, and external market shocks.
 * Scenarios: bull (Expansion), bear (Contraction), and black_swan (90% market crash).
 * Output: Generates a deterministic report on system solvency.
2. live_oracle_dashboard.py
A Python-based emulator of the Multi-Source Medianized Oracle.
 * Feature: Implements a 15% Volatility Circuit Breaker.
 * Logic: Aggregates price signals and rejects outliers to maintain a stable IPPR feed.
3. dashboard.html
A lightweight, high-performance visualization tool used to demonstrate the Internal Purchasing Power to non-technical stakeholders and merchants.
🚀 How to Run
Execute a Full Stress Test
To verify the protocol's resilience against a market crash:
python3 simulator/stochastic_abm_simulator.py --scenario black_swan

Launch the Real-Time Oracle Feed
To observe the dynamic $2,248,000 USD valuation in a live-emulated environment:
python3 simulator/live_oracle_dashboard.py

Visual Demonstration
Simply open dashboard.html in any modern web browser to view the interactive IPPR valuation dashboard.
📊 Evaluation Criteria
Reviewers should focus on the Reflexive Invariant Output. The simulator is successful if the internal value of REF remains stable despite P_{market} fluctuations, provided that the \Phi guardrail is active.
Next Step for Execution

