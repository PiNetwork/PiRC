use soroban_sdk::{contract, contractimpl, contractmeta, symbol_short, Address, BytesN, Env, Symbol};

contractmeta!(
    title = "PiRC-209 Verifiable Credentials Verifier (Soroban)",
    version = "1.0",
    description = "Verifiable Credentials issuance & verification for PiRC-209 with zk-proof support"
);

#[contract]
pub struct PiRC209VCVerifier;

#[contractimpl]
impl PiRC209VCVerifier {
    pub fn issue_vc(
        env: Env,
        issuer: Address,
        did_hash: Symbol,
        vc_hash: BytesN<32>,
        valid_days: u64,
        zk_proof: BytesN<32>,
    ) -> Symbol {
        issuer.require_auth();

        let credential_id = env.crypto().sha256(&vc_hash); // simplified ID generation

        let vc = VerifiableCredential {
            credential_id: credential_id.clone(),
            did_hash,
            issuer,
            issued_at: env.ledger().timestamp(),
            expires_at: env.ledger().timestamp() + (valid_days * 86400),
            vc_hash,
            is_valid: true,
            zk_proof,
        };

        env.storage().persistent().set(&credential_id, &vc);

        env.events().publish(
            (symbol_short!("VC"), symbol_short!("Issued")),
            (credential_id.clone(), did_hash),
        );

        credential_id
    }

    pub fn verify_vc(env: Env, credential_id: Symbol, provided_proof: BytesN<32>) -> bool {
        let vc: Option<VerifiableCredential> = env.storage().persistent().get(&credential_id);

        match vc {
            Some(mut vc) if vc.is_valid && env.ledger().timestamp() <= vc.expires_at => {
                let proof_valid = vc.zk_proof == provided_proof;
                if proof_valid {
                    env.events().publish((symbol_short!("VC"), symbol_short!("Verified")), (credential_id, true));
                    true
                } else {
                    // Trigger Justice Engine slash
                    false
                }
            }
            _ => false,
        }
    }

    // revoke_vc, etc.
}

#[derive(soroban_sdk::serde::Serialize, soroban_sdk::serde::Deserialize)]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerifiableCredential {
    pub credential_id: Symbol,
    pub did_hash: Symbol,
    pub issuer: Address,
    pub issued_at: u64,
    pub expires_at: u64,
    pub vc_hash: BytesN<32>,
    pub is_valid: bool,
    pub zk_proof: BytesN<32>,
}
