# PiRC Economic Model

## Overview

The PiRC economic model defines the relationship between token supply,
liquidity growth, economic activity, and reward distribution.

The objective is to create a sustainable economic loop within the Pi ecosystem.

Core variables:

S = token supply
L = liquidity
A = economic activity
F = protocol fees
R = rewards distributed

The PiRC loop can be expressed as:

S → L → A → F → R → S

This reflexive loop ensures that reward issuance is linked to real economic activity.

---

## Economic Flow

1 Pioneer Supply increases available tokens.

2 Liquidity providers deposit tokens into liquidity pools.

3 Economic activity generates transaction fees.

4 Fees are partially routed to the treasury.

5 Rewards are distributed to participants.

---

## Economic Stability

To prevent inflation, the protocol introduces several constraints:

reward_emission ≤ fee_generation × emission_multiplier

Where:

emission_multiplier ∈ [0.5 , 2.0]

These bounds ensure that reward emissions remain tied to real activity.

---

## Long-Term Objective

The model attempts to stabilize the ecosystem by aligning:

• token incentives  
• liquidity incentives  
• user participation
