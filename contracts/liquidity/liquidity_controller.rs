pub struct LiquidityController {
    pub liquidity_pool: u128,
}

impl LiquidityController {

    pub fn new() -> Self {
        Self {
            liquidity_pool: 0,
        }
    }

    pub fn add_liquidity(&mut self, amount: u128) {
        self.liquidity_pool += amount;
    }

    pub fn remove_liquidity(&mut self, amount: u128) {
        if self.liquidity_pool >= amount {
            self.liquidity_pool -= amount;
        }
    }

}
