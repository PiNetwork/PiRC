use soroban_sdk::{contractimpl, Env, Address, Map, Vec};

pub struct Governance;

#[contractimpl]
impl Governance {
    pub fn submit_proposal(env: Env, proposer: Address, desc: Vec<u8>) {
        let key = (b"proposal_count", ());
        let mut id: u64 = env.storage().get(&key).unwrap_or(0);
        env.storage().set(&(b"proposal", id), &desc);
        id += 1;
        env.storage().set(&key, &id);
    }

    pub fn vote(env: Env, proposal_id: u64, voter: Address, weight: u64) {
        let key = (b"votes", proposal_id, voter);
        env.storage().set(&key, &weight);
    }
}
