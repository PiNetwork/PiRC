#![no_std]
use soroban_sdk::{contract, contractimpl, Symbol, token};
use shared::{EscrowState, MilestoneState, GroupEscrowState, Milestone, GroupParticipant, GroupEscrow, EscrowAccount};

#[cfg(test)]
mod test;

const ECTR: Symbol = Symbol::new(&[], "ectr");
const GCTR: Symbol = Symbol::new(&[], "gctr");
const FEE: Symbol = Symbol::new(&[], "fee");
const COORD: Symbol = Symbol::new(&[], "coord");
fn ekey(env: &soroban_sdk::Env, id: u64) -> Symbol { Symbol::new(&[], &format!("e_{}", id).as_str()) }
fn gkey(env: &soroban_sdk::Env, id: u64) -> Symbol { Symbol::new(&[], &format!("g_{}", id).as_str()) }

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(env: soroban_sdk::Env, coordinator: soroban_sdk::Address, fee_bps: u32) {
        coordinator.require_auth();
        if fee_bps > 1000 { panic!("ESC015: Fee exceed max"); }
        env.storage().persistent().set(&COORD, &coordinator);
        env.storage().persistent().set(&FEE, &fee_bps);
        env.storage().persistent().set(&ECTR, &0u64);
        env.storage().persistent().set(&GCTR, &0u64);
    }

    pub fn create_escrow(
        env: soroban_sdk::Env, buyer: soroban_sdk::Address, seller: soroban_sdk::Address,
        amount: i128, token_addr: soroban_sdk::Address, delivery_deadline: u64,
        auto_release_timeout: u64, order_metadata: soroban_sdk::BytesN<32>,
    ) -> u64 {
        buyer.require_auth();
        if amount <= 0 { panic!("ESC007: Amount zero"); }
        if buyer == seller { panic!("ESC009: Buyer seller same"); }
        let id: u64 = env.storage().persistent().get(&ECTR).unwrap_or(0) + 1;
        let now = env.ledger().timestamp();
        let escrow = EscrowAccount {
            escrow_id: id, buyer, seller, amount, token: token_addr,
            state: EscrowState::Created, created_at: now,
            delivery_deadline, confirmation_deadline: delivery_deadline + auto_release_timeout,
            auto_release_timeout, subscription_id: None, order_metadata,
            is_milestone: false, milestones: soroban_sdk::Vec::new(&env),
            current_milestone: 0, released_amount: 0,
        };
        env.storage().persistent().set(&ekey(&env, id), &escrow);
        env.storage().persistent().set(&ECTR, &id);
        env.events().publish((Symbol::new(&[], "escrow_created"), id), (escrow.buyer.clone(), amount));
        id
    }

    pub fn fund_escrow(env: soroban_sdk::Env, buyer: soroban_sdk::Address, escrow_id: u64) {
        buyer.require_auth();
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.buyer != buyer { panic!("ESC001: Not buyer"); }
        if e.state != EscrowState::Created { panic!("ESC003: Not Created"); }
        let fee_bps: u32 = env.storage().persistent().get(&FEE).unwrap_or(100);
        let fee = e.amount * fee_bps as i128 / 10000;
        token::Client::new(&env, &e.token).transfer(&buyer, &env.current_contract_address(), &(e.amount + fee));
        e.state = EscrowState::Funded;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "escrow_funded"), escrow_id), (buyer, e.amount));
    }

    pub fn confirm_delivery(env: soroban_sdk::Env, seller: soroban_sdk::Address, escrow_id: u64) {
        seller.require_auth();
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.seller != seller { panic!("ESC002: Not seller"); }
        if e.state != EscrowState::Funded { panic!("ESC004: Not Funded"); }
        e.state = EscrowState::Delivered;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "delivery_confirmed"), escrow_id), seller);
    }

    pub fn confirm_receipt(env: soroban_sdk::Env, buyer: soroban_sdk::Address, escrow_id: u64) {
        buyer.require_auth();
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.buyer != buyer { panic!("ESC001: Not buyer"); }
        if e.state != EscrowState::Delivered { panic!("ESC005: Not Delivered"); }
        let fee_bps: u32 = env.storage().persistent().get(&FEE).unwrap_or(100);
        let fee = e.amount * fee_bps as i128 / 10000;
        token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.seller, &(e.amount - fee));
        e.state = EscrowState::Completed;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "escrow_completed"), escrow_id), (buyer, e.amount));
    }

    pub fn auto_release(env: soroban_sdk::Env, _caller: soroban_sdk::Address, escrow_id: u64) {
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.state != EscrowState::Delivered { panic!("ESC005: Not Delivered"); }
        if env.ledger().timestamp() < e.confirmation_deadline { panic!("ESC013: Timeout not reached"); }
        let fee_bps: u32 = env.storage().persistent().get(&FEE).unwrap_or(100);
        let fee = e.amount * fee_bps as i128 / 10000;
        token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.seller, &(e.amount - fee));
        e.state = EscrowState::Completed;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "auto_released"), escrow_id), e.seller.clone());
    }

    pub fn cancel_escrow(env: soroban_sdk::Env, caller: soroban_sdk::Address, escrow_id: u64) {
        caller.require_auth();
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.state != EscrowState::Created && e.state != EscrowState::Funded { panic!("ESC012: Cannot cancel"); }
        if e.state == EscrowState::Funded {
            token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.buyer, &e.amount);
        }
        e.state = EscrowState::Cancelled;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "escrow_cancelled"), escrow_id), caller);
    }

    pub fn expire_escrow(env: soroban_sdk::Env, _caller: soroban_sdk::Address, escrow_id: u64) {
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.state != EscrowState::Funded { panic!("ESC004: Not Funded"); }
        if env.ledger().timestamp() < e.delivery_deadline { panic!("ESC008: Deadline not passed"); }
        token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.buyer, &e.amount);
        e.state = EscrowState::Expired;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "escrow_expired"), escrow_id), e.buyer.clone());
    }

    pub fn freeze_for_dispute(env: soroban_sdk::Env, _caller: soroban_sdk::Address, escrow_id: u64) {
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.state != EscrowState::Funded && e.state != EscrowState::Delivered { panic!("Invalid state for dispute"); }
        e.state = EscrowState::Disputed;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
    }

    pub fn execute_ruling(env: soroban_sdk::Env, _caller: soroban_sdk::Address, escrow_id: u64, buyer_pct: u32) {
        if buyer_pct > 100 { panic!("ESC011: Invalid percentage"); }
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.state != EscrowState::Disputed { panic!("ESC006: Not Disputed"); }
        let buyer_amt = e.amount * buyer_pct as i128 / 100;
        let seller_amt = e.amount - buyer_amt;
        if buyer_amt > 0 { token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.buyer, &buyer_amt); }
        if seller_amt > 0 { token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.seller, &seller_amt); }
        e.state = EscrowState::Resolved;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "ruling_executed"), escrow_id), (buyer_pct, buyer_amt, seller_amt));
    }

    // --- v1.1: Milestone Escrow ---
    pub fn create_milestone_escrow(
        env: soroban_sdk::Env, buyer: soroban_sdk::Address, seller: soroban_sdk::Address,
        total_amount: i128, token_addr: soroban_sdk::Address,
        ms_amounts: soroban_sdk::Vec<i128>, ms_deadlines: soroban_sdk::Vec<u64>,
        ms_descs: soroban_sdk::Vec<soroban_sdk::BytesN<32>>,
        auto_release_timeout: u64, order_metadata: soroban_sdk::BytesN<32>,
    ) -> u64 {
        buyer.require_auth();
        if ms_amounts.len() < 2 { panic!("Need at least 2 milestones"); }
        let id: u64 = env.storage().persistent().get(&ECTR).unwrap_or(0) + 1;
        let mut milestones = soroban_sdk::Vec::new(&env);
        for i in 0..ms_amounts.len() {
            milestones.push_back(Milestone {
                milestone_id: i as u32,
                description_hash: ms_descs.get(i).unwrap(),
                amount: ms_amounts.get(i).unwrap(),
                state: MilestoneState::Pending,
                deadline: ms_deadlines.get(i).unwrap(),
                submitted_at: None, confirmed_at: None,
            });
        }
        let now = env.ledger().timestamp();
        let escrow = EscrowAccount {
            escrow_id: id, buyer, seller, amount: total_amount, token: token_addr,
            state: EscrowState::MilestoneActive, created_at: now,
            delivery_deadline: ms_deadlines.get(ms_deadlines.len() - 1).unwrap(),
            confirmation_deadline: now + auto_release_timeout,
            auto_release_timeout, subscription_id: None, order_metadata,
            is_milestone: true, milestones, current_milestone: 0, released_amount: 0,
        };
        env.storage().persistent().set(&ekey(&env, id), &escrow);
        env.storage().persistent().set(&ECTR, &id);
        env.events().publish((Symbol::new(&[], "milestone_escrow_created"), id), total_amount);
        id
    }

    pub fn submit_milestone(env: soroban_sdk::Env, seller: soroban_sdk::Address, escrow_id: u64, ms_id: u32) {
        seller.require_auth();
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.seller != seller { panic!("ESC002: Not seller"); }
        let mut ms = e.milestones.get(ms_id as usize).unwrap();
        if ms.state != MilestoneState::Pending { panic!("Milestone not pending"); }
        ms.state = MilestoneState::Submitted;
        ms.submitted_at = Some(env.ledger().timestamp());
        e.milestones.set(ms_id as usize, ms);
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "milestone_submitted"), escrow_id), ms_id);
    }

    pub fn confirm_milestone(env: soroban_sdk::Env, buyer: soroban_sdk::Address, escrow_id: u64, ms_id: u32) {
        buyer.require_auth();
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        if e.buyer != buyer { panic!("ESC001: Not buyer"); }
        let mut ms = e.milestones.get(ms_id as usize).unwrap();
        if ms.state != MilestoneState::Submitted { panic!("Milestone not submitted"); }
        let fee_bps: u32 = env.storage().persistent().get(&FEE).unwrap_or(100);
        let fee = ms.amount * fee_bps as i128 / 10000;
        token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.seller, &(ms.amount - fee));
        ms.state = MilestoneState::Released;
        ms.confirmed_at = Some(env.ledger().timestamp());
        e.milestones.set(ms_id as usize, ms);
        e.released_amount += ms.amount;
        e.current_milestone = ms_id + 1;
        if e.released_amount >= e.amount { e.state = EscrowState::Completed; }
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "milestone_confirmed"), escrow_id), ms_id);
    }

    pub fn expire_milestone(env: soroban_sdk::Env, _caller: soroban_sdk::Address, escrow_id: u64, ms_id: u32) {
        let mut e: EscrowAccount = env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap();
        let mut ms = e.milestones.get(ms_id as usize).unwrap();
        if ms.state != MilestoneState::Pending && ms.state != MilestoneState::Submitted { panic!("Milestone not expirable"); }
        if env.ledger().timestamp() < ms.deadline { panic!("Deadline not passed"); }
        ms.state = MilestoneState::Expired;
        e.milestones.set(ms_id as usize, ms);
        let remaining = e.amount - e.released_amount - ms.amount;
        if remaining > 0 { token::Client::new(&env, &e.token).transfer(&env.current_contract_address(), &e.buyer, &remaining); }
        e.state = EscrowState::Resolved;
        env.storage().persistent().set(&ekey(&env, escrow_id), &e);
        env.events().publish((Symbol::new(&[], "milestone_expired"), escrow_id), ms_id);
    }

    // --- v1.1: Group Escrow ---
    pub fn create_group_escrow(
        env: soroban_sdk::Env, organizer: soroban_sdk::Address, seller: soroban_sdk::Address,
        token_addr: soroban_sdk::Address, total_amount: i128,
        participants: soroban_sdk::Vec<GroupParticipant>,
        funding_deadline: u64, delivery_deadline: u64, auto_release_timeout: u64,
        order_metadata: soroban_sdk::BytesN<32>,
    ) -> u64 {
        organizer.require_auth();
        if total_amount <= 0 { panic!("ESC007: Amount zero"); }
        let id: u64 = env.storage().persistent().get(&GCTR).unwrap_or(0) + 1;
        let group = GroupEscrow {
            escrow_id: id, organizer, seller, token: token_addr,
            total_amount, funded_amount: 0, state: GroupEscrowState::Collecting,
            participants, created_at: env.ledger().timestamp(),
            funding_deadline, delivery_deadline, auto_release_timeout, order_metadata,
        };
        env.storage().persistent().set(&gkey(&env, id), &group);
        env.storage().persistent().set(&GCTR, &id);
        env.events().publish((Symbol::new(&[], "group_escrow_created"), id), total_amount);
        id
    }

    pub fn fund_group_escrow(env: soroban_sdk::Env, buyer: soroban_sdk::Address, escrow_id: u64) {
        buyer.require_auth();
        let mut g: GroupEscrow = env.storage().persistent().get(&gkey(&env, escrow_id)).unwrap();
        if g.state != GroupEscrowState::Collecting { panic!("Not in collecting state"); }
        let mut found = false;
        for i in 0..g.participants.len() {
            let mut p = g.participants.get(i).unwrap();
            if p.buyer == buyer && !p.funded {
                token::Client::new(&env, &g.token).transfer(&buyer, &env.current_contract_address(), &p.amount);
                p.funded = true;
                p.funded_at = Some(env.ledger().timestamp());
                g.funded_amount += p.amount;
                g.participants.set(i, p);
                found = true;
                break;
            }
        }
        if !found { panic!("Not a participant or already funded"); }
        if g.funded_amount >= g.total_amount { g.state = GroupEscrowState::FullyFunded; }
        env.storage().persistent().set(&gkey(&env, escrow_id), &g);
        env.events().publish((Symbol::new(&[], "group_funded"), escrow_id), (buyer, g.funded_amount));
    }

    pub fn get_escrow(env: soroban_sdk::Env, escrow_id: u64) -> EscrowAccount {
        env.storage().persistent().get(&ekey(&env, escrow_id)).unwrap()
    }

    pub fn get_group_escrow(env: soroban_sdk::Env, escrow_id: u64) -> GroupEscrow {
        env.storage().persistent().get(&gkey(&env, escrow_id)).unwrap()
    }
}
