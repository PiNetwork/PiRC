use soroban_sdk::{contract, contractimpl, contractmeta, symbol_short, Address, Env, String, Vec};

contractmeta!(
    title = "PiRC-212 Sovereign Governance (Soroban)",
    version = "1.0",
    description = "Decentralized proposal and voting system anchored to PiRC-207"
);

#[contract]
pub struct PiRC212Governance;

#[contractimpl]
impl PiRC212Governance {
    pub fn create_proposal(
        env: Env,
        proposer: Address,
        title: String,
        description: String,
        voting_days: u64,
    ) -> u64 {
        proposer.require_auth();

        let proposal_id = env.ledger().sequence(); // simple unique ID

        let proposal = Proposal {
            id: proposal_id,
            proposer,
            title,
            description,
            start_time: env.ledger().timestamp(),
            end_time: env.ledger().timestamp() + (voting_days * 86400),
            for_votes: 0,
            against_votes: 0,
            executed: false,
        };

        env.storage().persistent().set(&proposal_id, &proposal);

        env.events().publish(
            (symbol_short!("Proposal"), symbol_short!("Created")),
            (proposal_id, proposer),
        );

        proposal_id
    }

    pub fn vote(env: Env, voter: Address, proposal_id: u64, support: bool) {
        voter.require_auth();

        let mut proposal: Proposal = env.storage().persistent().get(&proposal_id).unwrap();

        let voting_power = 1000000u128; // replace with real 7-Layer weight later

        if support {
            proposal.for_votes += voting_power;
        } else {
            proposal.against_votes += voting_power;
        }

        env.storage().persistent().set(&proposal_id, &proposal);

        env.events().publish(
            (symbol_short!("Vote"), symbol_short!("Cast")),
            (proposal_id, voter, support),
        );
    }
}

#[derive(soroban_sdk::serde::Serialize, soroban_sdk::serde::Deserialize)]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Address,
    pub title: String,
    pub description: String,
    pub start_time: u64,
    pub end_time: u64,
    pub for_votes: u128,
    pub against_votes: u128,
    pub executed: bool,
}




