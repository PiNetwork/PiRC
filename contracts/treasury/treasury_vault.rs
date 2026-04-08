pub struct TreasuryVault {
    pub reserves: u128,
}

impl TreasuryVault {

    pub fn new() -> Self {
        Self {
            reserves: 0,
        }
    }

    pub fn deposit(&mut self, amount: u128) {
        self.reserves += amount;
    }

    pub fn withdraw(&mut self, amount: u128) {
        if self.reserves >= amount {
            self.reserves -= amount;
        }
    }

    pub fn get_reserves(&self) -> u128 {
        self.reserves
    }

}
