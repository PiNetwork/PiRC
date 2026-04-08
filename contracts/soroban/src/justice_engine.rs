#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, panic_with_error};

// Define custom errors for the Justice Engine
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum JusticeError {
    PhiGuardrailTriggered = 1,
    MathOverflow = 2,
    Unauthorized = 3,
}

#[contract]
pub struct JusticeEngineContract;

#[contractimpl]
impl JusticeEngineContract {
    
    /// Constants representing the PiRC-101 Architecture
    const QWF_MAX: i128 = 10_000_000; // 10^7 Sovereign Multiplier
    const MIN_QWF: i128 = 100_000;    // Minimum baseline multiplier
    const DECAY_RATE: i128 = 500;     // Linear decay approximation per epoch

    /// Calculates the Effective QWF (Dynamic Multiplier Smoothing)
    /// Blockchain environments use integer approximation for e^(-lambda * t)
    pub fn calculate_qwf_eff(env: Env, time_elapsed: i128) -> i128 {
        // Integer-based decay to save compute (Rent) on Stellar/Soroban
        let decay_amount = time_elapsed.checked_mul(Self::DECAY_RATE)
            .unwrap_or(Self::QWF_MAX); // Fallback to max penalty on overflow
            
        let qwf_eff = Self::QWF_MAX.checked_sub(decay_amount).unwrap_or(Self::MIN_QWF);
        
        // Clamp the result to ensure it never falls below MIN_QWF
        if qwf_eff < Self::MIN_QWF {
            Self::MIN_QWF
        } else {
            qwf_eff
        }
    }

    /// Evaluates the Phi (Φ) Reflexive Guardrail to prevent hyperinflation
    /// Φ = (L_internal / S_ref)^2
    pub fn check_phi_solvency(env: Env, liquidity_internal: i128, supply_ref: i128) -> bool {
        if supply_ref == 0 {
            return true; // Genesis state is always solvent
        }

        // Using i128 to prevent overflow during quadratic calculation
        let l_squared = liquidity_internal.checked_mul(liquidity_internal).unwrap_or(0);
        let s_squared = supply_ref.checked_mul(supply_ref).unwrap_or(i128::MAX);

        // If L^2 >= S^2, then Φ >= 1 (Expansion Allowed)
        l_squared >= s_squared
    }

    /// The core minting function for $REF Capacity Units
    pub fn mint_ref_capacity(
        env: Env, 
        pioneer: Address, 
        pi_locked: i128, 
        market_price: i128, // Represented in fixed-point (e.g., 2248 for $0.2248)
        time_elapsed: i128,
        current_liquidity: i128,
        current_supply: i128
    ) -> i128 {
        // 1. Authenticate Pioneer (Utility Gating)
        pioneer.require_auth();

        // 2. Check Systemic Solvency (The Phi Guardrail)
        if !Self::check_phi_solvency(env.clone(), current_liquidity, current_supply) {
            panic_with_error!(&env, JusticeError::PhiGuardrailTriggered);
        }

        // 3. Calculate Meritocratic Multiplier (DMS)
        let active_qwf = Self::calculate_qwf_eff(env.clone(), time_elapsed);

        // 4. Calculate Minting Capacity (Minting Difficulty D_m implicitly handled)
        // Pi_locked * Price * QWF_eff
        let base_value = pi_locked.checked_mul(market_price)
            .unwrap_or_else(|| panic_with_error!(&env, JusticeError::MathOverflow));
            
        let ref_minted = base_value.checked_mul(active_qwf)
            .unwrap_or_else(|| panic_with_error!(&env, JusticeError::MathOverflow));

        // Note: In production, ref_minted would be divided by standard fixed-point decimals
        
        ref_minted
    }
}
