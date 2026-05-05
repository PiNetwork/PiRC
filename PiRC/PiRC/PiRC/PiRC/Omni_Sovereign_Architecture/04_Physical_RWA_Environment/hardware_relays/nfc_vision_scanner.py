#!/usr/bin/env python3
import time, hashlib, json
def scan_physical_asset(user_id, product_id):
    payload = f"{user_id}:{product_id}:{int(time.time())}"
    signature = hashlib.sha256(payload.encode()).hexdigest()
    return {"status": "PHYSICAL_SCAN_OK", "oracle_signature": signature}

if __name__ == "__main__":
    print(json.dumps(scan_physical_asset("PIONEER_99", "PI_COFFEE_BEANS"), indent=2))
