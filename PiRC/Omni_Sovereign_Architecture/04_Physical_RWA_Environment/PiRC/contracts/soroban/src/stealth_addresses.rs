use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC242StealthAddresses;

#[contractimpl]
impl PiRC242StealthAddresses {
    pub fn register_stealth_key(env: Env, owner: Address, pub_key_x: U256, pub_key_y: U256) {
        owner.require_auth();
        env.events().publish((symbol_short!("Stealth"), symbol_short!("Reg")), (owner, pub_key_x, pub_key_y));
    }
}
