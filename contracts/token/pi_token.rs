pub struct PiToken {
    pub total_supply: u128,
}

impl PiToken {

    pub fn new() -> Self {
        Self {
            total_supply: 0,
        }
    }

    pub fn mint(&mut self, amount: u128) {
        self.total_supply += amount;
    }

    pub fn burn(&mut self, amount: u128) {
        self.total_supply -= amount;
    }

    pub fn total_supply(&self) -> u128 {
        self.total_supply
    }

}
