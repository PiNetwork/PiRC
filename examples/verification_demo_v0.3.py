#!/usr/bin/env python3

import json
import hashlib
from datetime import datetime

def load_schema():
    with open('../spec/rwa_auth_schema_v0.3.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def simulate_verification(product_id: str, method: str = "NFC"):
    print(f"🚀 RWA v0.3 Demo – Scanning {method}: {product_id}")
    
    load_schema()

    with open('eyewear_canonical_example.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    data["pid"] = hashlib.sha256(
        f"{product_id}-{datetime.now().isoformat()}".encode()
    ).hexdigest()

    data["timestamp_registered"] = datetime.now().isoformat()

    if method == "NFC":
        data["auth"]["chip_uid"] = "04:AB:CD:EF:12:34:56:78"
        data["auth"]["signed_payload"] = "signed(pid + chip_uid)"

    print("\n📋 Product Metadata:")
    print(json.dumps(data, indent=2, ensure_ascii=False))

    result = {
        "status": "AUTHENTIC",
        "confidence_score": 98,
        "issuer_verified": True,
        "signature_valid": True
    }

    print("\n✅ Verification Result:")
    print(json.dumps(result, indent=2))

    return data, result

if __name__ == "__main__":
    print("PiRC RWA v0.3 – Verification Demo")

    pid = input("Enter Product ID (or press Enter): ") or "EYEWEAR-LUXE-001"
    method = input("Scan method (QR or NFC): ") or "NFC"

    simulate_verification(pid, method.upper())
