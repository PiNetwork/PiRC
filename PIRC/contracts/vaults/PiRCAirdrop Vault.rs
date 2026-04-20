mod pirc_config;
#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Env, Address, Symbol, Map, Vec, log
};

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub issue_ts: u64,
    pub caps: Vec<i128>,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Config,
    Distributed,
    Claimed,
    Paused,
}

#[contract]
pub struct PiRCAirdropVault;

#[contractimpl]
impl PiRCAirdropVault {

    pub fn initialize(env: Env, admin: Address, issue_ts: u64) {

        admin.require_auth();

        let caps = Vec::from_array(
            &env,
            [
                500_000i128,
                350_000i128,
                250_000i128,
                180_000i128,
                120_000i128,
                100_000i128,
            ],
        );

        let cfg = Config { issue_ts, caps };

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Config, &cfg);
        env.storage().instance().set(&DataKey::Distributed, &0i128);
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    pub fn pause(env: Env, admin: Address) {
        admin.require_auth();

        let stored: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

        if admin != stored {
            panic!("not admin");
        }

        env.storage().instance().set(&DataKey::Paused, &true);
    }

    pub fn unpause(env: Env, admin: Address) {
        admin.require_auth();

        let stored: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

        if admin != stored {
            panic!("not admin");
        }

        env.storage().instance().set(&DataKey::Paused, &false);
    }

    pub fn current_wave(env: Env) -> i32 {

        let cfg: Config = env.storage().instance().get(&DataKey::Config).unwrap();

        let t = env.ledger().timestamp();

        let mut unlock = cfg.issue_ts + 14 * 86400;

        for i in 0..6 {

            if t < unlock {
                return i as i32 - 1;
            }

            unlock += 90 * 86400;
        }

        5
    }

    pub fn unlocked_total(env: Env) -> i128 {

        let cfg: Config = env.storage().instance().get(&DataKey::Config).unwrap();

        let wave = Self::current_wave(env.clone());

        if wave < 0 {
            return 0;
        }

        let mut sum: i128 = 0;

        for i in 0..=wave {

            sum += cfg.caps.get(i as u32).unwrap();
        }

        sum
    }

    pub fn claim(env: Env, user: Address, amount: i128) {

        user.require_auth();

        let paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap();

        if paused {
            panic!("paused");
        }

        let mut claimed: Map<Address,bool> =
            env.storage().instance().get(&DataKey::Claimed)
            .unwrap_or(Map::new(&env));

        if claimed.get(user.clone()).unwrap_or(false) {
            panic!("already claimed");
        }

        let unlocked = Self::unlocked_total(env.clone());

        let mut distributed: i128 =
            env.storage().instance().get(&DataKey::Distributed).unwrap();

        if distributed + amount > unlocked {
            panic!("wave cap exceeded");
        }

        claimed.set(user.clone(), true);

        distributed += amount;

        env.storage().instance().set(&DataKey::Claimed, &claimed);
        env.storage().instance().set(&DataKey::Distributed, &distributed);

        log!(&env, "claim", user, amount);
    }

    pub fn distributed(env: Env) -> i128 {

        env.storage().instance().get(&DataKey::Distributed).unwrap()
    }
}
