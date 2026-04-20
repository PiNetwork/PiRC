use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String, BytesN};

#[contract]
pub struct PiRC258dAppABI;

#[contractimpl]
impl PiRC258dAppABI {
    pub fn register_abi(env: Env, admin: Address, interface_id: BytesN<32>, abi_string: String) {
        admin.require_auth();
        env.events().publish((symbol_short!("dAppABI"), symbol_short!("Reg")), interface_id);
    }
}
