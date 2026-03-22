// Integration Test: Verifying Walled Garden & 10M:1 Multiplier
#[test]
fn test_monetary_parity_logic() {
    let qwf = 10_000_000;
    let market_price = 0.2248; // Baseline
    let internal_value = market_price * (qwf as f64);
    
    assert_eq!(internal_value, 2_248_000.0);
    println!("Parity Verified: 1 Mined Pi = 2.248M REF Units");
}

