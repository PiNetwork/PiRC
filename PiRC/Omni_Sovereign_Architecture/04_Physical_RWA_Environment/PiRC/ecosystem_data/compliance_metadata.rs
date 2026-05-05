mod pirc_config;
// Metadata structure for AML/KYC tracking on every transaction
struct TransactionAudit {
    source_app_id: Symbol,
    product_category: Symbol,
    timestamp: u64,
    currency_type: Symbol, // Visa_Gateway or Sovereign_Token
    is_compliant: bool,
}
