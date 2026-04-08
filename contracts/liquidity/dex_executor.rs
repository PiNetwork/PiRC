pub struct DexExecutor;

impl DexExecutor {

    pub fn execute_swap(input_amount: u128, price: f64) -> u128 {

        (input_amount as f64 * price) as u128

    }

}
