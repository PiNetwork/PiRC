ض.md
PiRC-45: Standardized Transaction Metadata & Interoperability Protocol
📌 Overview
PiRC-45 introduces a unified framework for transaction metadata handling within the Pi Network ecosystem. This standard resolves long-standing inconsistencies in dApp-to-Wallet communication (Issue #16) and adheres to the structural governance defined in PR #2.
By implementing this protocol, developers ensure their applications are Mainnet-ready, secure, and fully compatible with the Pi Browser's latest security layers.
🚀 Key Benefits
 * Zero-Ambiguity Transactions: Eliminates "Unknown Transaction" errors in the Pi Wallet.
 * Integrity Verification: Built-in cryptographic checksums to prevent payload tampering.
 * Developer Efficiency: Standardized error codes and response schemas for faster debugging.
 * Scalability: Stateless validation logic designed for high-frequency micro-payments.
🛠 Technical Specification
1. Unified Metadata Schema
All payment requests must now include the metadata object following this JSON structure:
{
  "pirc_version": "45.1",
  "app_id": "YOUR_APP_ID",
  "transaction_context": {
    "type": "goods_and_services",
    "memo_id": "unique_identifier_string",
    "integrity_hash": "sha256_checksum_of_payload"
  },
  "callback_config": {
    "url": "https://api.yourdomain.com/pi-callback",
    "retry_policy": "exponential_backoff"
  }
}

2. Validation Rules (Compliance with #16)
To pass the PiRC-45 validation layer, the following conditions must be met:
 * memo_id: Must be a non-empty string (max 128 chars).
 * integrity_hash: Must be generated using the SHA-256 algorithm combining the amount, recipient, and app_id.
 * pirc_version: Must match the current supported protocol version.
💻 Implementation Guide
Step 1: Install the Validation Hook
Ensure your backend or smart contract interface includes the PiRC-45 validation logic:
// Example: Validating metadata before initiating payment
const validatePiRC45 = (metadata) => {
  if (metadata.pirc_version !== "45.1") {
    throw new Error("Unsupported PiRC Version. Please update to PiRC-45.");
  }
  // Additional logic for checksum verification
  return true;
};

Step 2: Update Payment Call
When calling the Pi.createPayment() function, inject the compliant metadata object:
Pi.createPayment({
  amount: 3.14,
  memo: "Order #9982",
  metadata: pirc45_compliant_object, // The object defined in Section 1
}, {
  onReadyForServerApproval: (paymentId) => { /* ... */ },
  onReadyForServerCompletion: (paymentId, txid) => { /* ... */ },
  onCancel: (paymentId) => { /* ... */ },
  onError: (error, payment) => { /* ... */ },
});

⚠️ Error Handling & Troubleshooting
| Error Code | Meaning | Resolution |
|---|---|---|
| ERR_PIRC45_VERSION_MISMATCH | Outdated protocol version. | Update to the latest PiRC-45 SDK. |
| ERR_PIRC45_INTEGRITY_FAIL | Metadata hash does not match payload. | Ensure no fields were modified after hashing. |
| ERR_PIRC45_CONTEXT_MISSING | Required field transaction_context is null. | Verify your JSON construction. |
🤝 Contribution & Standards
This documentation is part of the PiRC (Pi Request for Comments) initiative. To propose changes, please reference PR #2 for formatting guidelines.
 * Lead Contributor: [Ze0ro99]
 * References: [Issue #16], [PR #45], [PR #2]
Final Pro-Tip for Submission:
When you post this on GitHub, make sure to link the text [Issue #16] and [PR #2] to their respective URLs so the maintainers can navigate easily.

# PiRC Unified Standards Repository

## Overview
This repository contains the official specifications for **PiRC-45** and **PiRC2**.

### Quick Start for Developers
1. **Compliance:** All dApp transactions must follow the JSON schema in `/schemas/pirc45_standard.json`.
2. **Implementation:**
   ```javascript
   // Example Metadata Generation
   const metadata = {
     version: "45.1",
     app_id: "your_app_name",
     payload: {
       memo_id: "order_123",
       integrity_hash: "sha256_hash_here",
       type: "goods"
     }
   };

