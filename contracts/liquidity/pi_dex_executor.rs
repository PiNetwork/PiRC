#![no_std]
use soroban_sdk::{
    contractimpl, symbol, Address, Env, Symbol, Vec, map, Map,
};

/// Interface DEX — ini harus disesuaikan ketika DEX Pi nyata tersedia
pub trait PiDex {
    fn add_liquidity(
        &self,
        env: Env,
        token_amount: u128,
        pi_amount: u128,
    ) -> (u128, u128, u128);
}

/// Executor kontrak yang memanggil fungsi add_liquidity
pub struct PiDexExecutor;

#[contractimpl]
impl PiDexExecutor {

    /// Eksekusi add liquidity ke DEX
    /// - controller memanggil executor
    /// - executor memanggil DEX dan menambahkan liquidity
    pub fn execute(
        env: Env,
        dex_address: Address,
        token_amount: u128,
        pi_amount: u128,
    ) {

        // Panggil DEX yaitu kontrak PiDex
        // Asumsi fungsi di DEX bernama "add_liquidity"
        let dex_contract = dex_address;

        let args = (token_amount, pi_amount);

        // Panggil fungsi add_liquidity di DEX
        let result: (u128, u128, u128) = env.invoke_contract(
            &dex_contract,
            &Symbol::new(&env, "add_liquidity"),
            &args,
        );

        // result = (actual_token_added, actual_pi_added, liquidity_shares)
        // Simpan hasil ke storage untuk dibaca kembali
        env.storage().set(
            (&symbol!("last_dex_result"), &dex_contract),
            &result,
        );
    }

    /// Ambil hasil terakhir dari DEX
    pub fn last_result(env: Env, dex_address: Address) -> Option<(u128, u128, u128)> {
        env.storage().get((&symbol!("last_dex_result"), &dex_address))
    }
}
