use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, BytesN};

#[contract]
pub struct PiRC249StateSync;

#[contractimpl]
impl PiRC249StateSync {
    pub fn sync_root(env: Env, validator: Address, new_root: BytesN<32>) {
        validator.require_auth();
        env.events().publish((symbol_short!("StateSync"), symbol_short!("Synced")), new_root);
    }
}
