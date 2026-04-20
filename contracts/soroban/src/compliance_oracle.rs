use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String};

#[contract]
pub struct PiRC247ComplianceOracle;

#[contractimpl]
impl PiRC247ComplianceOracle {
    pub fn update_sanction(env: Env, node: Address, account: Address, status: bool, reason: String) {
        node.require_auth();
        env.events().publish((symbol_short!("Complianc"), symbol_short!("Update")), (account, status, reason));
    }
}
