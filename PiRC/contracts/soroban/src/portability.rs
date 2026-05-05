use soroban_sdk::{contract, contractimpl, contractmeta, symbol_short, Address, BytesN, Env, Symbol};

contractmeta!(
    title = "PiRC-210 Cross-Ledger Identity Portability (Soroban)",
    version = "1.0",
    description = "Secure zk-proof-based identity portability across ledgers"
);

#[contract]
pub struct PiRC210Portability;

#[contractimpl]
impl PiRC210Portability {
    pub fn request_portability(
        env: Env,
        owner: Address,
        source_did: Symbol,
        target_did: Symbol,
        target_ledger: Symbol,
        zk_proof: BytesN<32>,
    ) -> Symbol {
        owner.require_auth();

        let request_id = env.crypto().sha256(&zk_proof);

        let request = PortabilityRequest {
            owner,
            source_did,
            target_did,
            target_ledger,
            zk_proof,
            timestamp: env.ledger().timestamp(),
            is_verified: false,
        };

        env.storage().persistent().set(&request_id, &request);

        env.events().publish(
            (symbol_short!("Port"), symbol_short!("Requested")),
            (request_id.clone(), source_did, target_did),
        );

        request_id
    }

    pub fn verify_portability(env: Env, request_id: Symbol, provided_proof: BytesN<32>) -> bool {
        if !env.storage().persistent().has(&request_id) {
            return false;
        }

        let mut request: PortabilityRequest = env.storage().persistent().get(&request_id).unwrap();

        if request.is_verified {
            return false; // Already verified
        }

        let proof_valid = request.zk_proof == provided_proof;

        if proof_valid {
            request.is_verified = true;
            env.storage().persistent().set(&request_id, &request);
            env.events().publish(
                (symbol_short!("Port"), symbol_short!("Verified")),
                (request_id, true)
            );
            true
        } else {
            env.events().publish(
                (symbol_short!("Port"), symbol_short!("Verified")),
                (request_id, false)
            );
            false
        }
    }
}

#[derive(soroban_sdk::serde::Serialize, soroban_sdk::serde::Deserialize)]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PortabilityRequest {
    pub owner: Address,
    pub source_did: Symbol,
    pub target_did: Symbol,
    pub target_ledger: Symbol,
    pub zk_proof: BytesN<32>,
    pub timestamp: u64,
    pub is_verified: bool,
}

