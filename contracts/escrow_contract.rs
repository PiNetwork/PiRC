mod pirc_config;
#[derive(Debug)]
pub struct Escrow {

    pub buyer: String,
    pub seller: String,
    pub amount: f64,
    pub released: bool

}

pub struct EscrowContract {

    pub escrow: Option<Escrow>

}

impl EscrowContract {

    pub fn create(
        buyer: String,
        seller: String,
        amount: f64
    ) -> Self {

        Self {

            escrow: Some(Escrow {
                buyer,
                seller,
                amount,
                released: false
            })

        }

    }

    pub fn release(&mut self) {

        if let Some(e) = &mut self.escrow {

            e.released = true;

        }

    }
}
