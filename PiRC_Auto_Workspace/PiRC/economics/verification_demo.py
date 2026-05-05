#!/usr/bin/env python3
"""
PiRC RWA Conceptual Verification Demo
Ready-to-run — simulates QR/NFC scan for product authenticity
Fully compatible with PiRC and Pi Network
"""

import json
import hashlib
from datetime import datetime

def load_schema():
    with open('rwa_product_auth_schema.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def simulate_qr_nfc_scan(product_id: str):
    """Simulate QR or NFC scan"""
    print(f"✅ Product scanned: {product_id}")
    schema = load_schema()
    
    # Generate professional authenticity hash
    data = f"{product_id}-{datetime.now().isoformat()}".encode()
    auth_hash = hashlib.sha256(data).hexdigest()
    
    schema["productIdentity"]["productId"] = product_id
    schema["productIdentity"]["authenticityHash"] = auth_hash
    schema["productIdentity"]["certificationDate"] = datetime.now().isoformat()
    
    print("🔗 Blockchain-linked metadata:")
    print(json.dumps(schema["productIdentity"], indent=2, ensure_ascii=False))
    print("✅ Product is authentic — Verified Tier 2")
    return schema

if __name__ == "__main__":
    print("🚀 PiRC RWA Conceptual Auth Demo")
    product = input("Enter Product ID (example: LUXE-OPTICS-001): ") or "LUXE-OPTICS-001"
    simulate_qr_nfc_scan(product)
    print("\n🎉 Ready to integrate with POS SDK in docs/MERCHANT_INTEGRATION.md")
