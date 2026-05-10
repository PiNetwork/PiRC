#![no_std]
use soroban_sdk::{contract, contractimpl, Symbol, Address, BytesN, Env};
use shared::{LoyaltyTier, RewardType, LoyaltyProfile};

#[cfg(test)]
mod test;

fn loyalty_key(_env: &Env, _addr: &Address) -> Symbol { Symbol::new(&[], "loyalty") }

fn points_to_tier(pts: u32) -> LoyaltyTier {
    if pts >= 10000 { LoyaltyTier::Legendary } else if pts >= 2000 { LoyaltyTier::Elite }
    else if pts >= 500 { LoyaltyTier::Trusted } else if pts >= 100 { LoyaltyTier::Regular }
    else { LoyaltyTier::Starter }
}

#[contract]
pub struct LoyaltyContract;

#[contractimpl]
impl LoyaltyContract {
    pub fn create_profile(env: Env, pioneer: Address) -> LoyaltyProfile {
        pioneer.require_auth();
        let p = LoyaltyProfile {
            pioneer: pioneer.clone(), points: 0, tier: LoyaltyTier::Starter,
            lifetime_points: 0, redeemable_points: 0, last_activity: env.ledger().timestamp(),
            referral_code: BytesN::from_array(&env, &[0;32]), referral_count: 0, activity_streak: 0,
        };
        env.storage().persistent().set(&loyalty_key(&env, &pioneer), &p);
        p
    }

    pub fn earn_points(env: Env, _caller: Address, pioneer: Address, _action: Symbol, amount: u32) {
        let mut p: LoyaltyProfile = env.storage().persistent().get(&loyalty_key(&env, &pioneer)).unwrap();
        p.points += amount; p.lifetime_points += amount; p.redeemable_points += amount;
        p.tier = points_to_tier(p.lifetime_points); p.last_activity = env.ledger().timestamp();
        env.storage().persistent().set(&loyalty_key(&env, &pioneer), &p);
    }

    pub fn redeem_reward(env: Env, pioneer: Address, _reward_type: RewardType, amount: u32) {
        pioneer.require_auth();
        let mut p: LoyaltyProfile = env.storage().persistent().get(&loyalty_key(&env, &pioneer)).unwrap();
        if p.redeemable_points < amount { panic!("Insufficient points"); }
        p.redeemable_points -= amount;
        env.storage().persistent().set(&loyalty_key(&env, &pioneer), &p);
    }

    pub fn get_profile(env: Env, pioneer: Address) -> LoyaltyProfile {
        env.storage().persistent().get(&loyalty_key(&env, &pioneer)).unwrap()
    }
}
