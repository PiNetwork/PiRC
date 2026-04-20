use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC246EscrowVault;

#[contractimpl]
impl PiRC246EscrowVault {
    pub fn create_escrow(env: Env, buyer: Address, seller: Address, amount: U256) {
        buyer.require_auth();
        env.events().publish((symbol_short!("Escrow"), symbol_short!("Created")), (buyer, seller, amount));
    }
}
