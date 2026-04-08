pub struct Governance {

    pub reward_multiplier: u128,
}

impl Governance {

    pub fn new() -> Self {
        Self {
            reward_multiplier: 1,
        }
    }

    pub fn update_multiplier(&mut self, value: u128) {
        self.reward_multiplier = value;
    }

}
