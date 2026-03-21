from web3 import Web3
import json

# -------------------------------
# Setup connection (example: Localhost)
# -------------------------------
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

# Load contract ABI & address
with open("BaseLinkedPiWithPenalties_abi.json") as f:
    abi = json.load(f)

contract_address = "0xYourContractAddressHere"  # Replace with deployed contract address
contract = w3.eth.contract(address=contract_address, abi=abi)

owner_address = w3.eth.accounts[0]  # owner for administrative actions

# -------------------------------
# 1️⃣ Register a participant
# -------------------------------
participant = w3.eth.accounts[1]
initial_pi = 1000  # Pi Base units
tx = contract.functions.registerParticipant(participant, initial_pi).transact({'from': owner_address})
w3.eth.wait_for_transaction_receipt(tx)
print(f"Participant registered with {initial_pi} Pi Base units")

# -------------------------------
# 2️⃣ Record verified Pi transactions
# -------------------------------
tx_amount = 50
tx = contract.functions.recordTransaction(participant, tx_amount).transact({'from': owner_address})
w3.eth.wait_for_transaction_receipt(tx)
print(f"Recorded {tx_amount} verified Pi transactions for participant")

# -------------------------------
# 3️⃣ Update reward based on verified transactions
# -------------------------------
total_tx_threshold = 200  # number of transactions needed for max multiplier
tx = contract.functions.updateReward(participant, total_tx_threshold).transact({'from': owner_address})
w3.eth.wait_for_transaction_receipt(tx)
balance, tx_count, reputation = contract.functions.getParticipantStatus(participant).call()
print(f"Updated balance: {balance}, txCount: {tx_count}, reputation: {reputation}")

# -------------------------------
# 4️⃣ Apply penalties
# -------------------------------
# Suspend reward
tx = contract.functions.suspendReward(participant, 7).transact({'from': owner_address})  # 7 days
w3.eth.wait_for_transaction_receipt(tx)
print("Reward suspended for 7 days")

# Reduce allocation
tx = contract.functions.reduceAllocation(participant, 100).transact({'from': owner_address})
w3.eth.wait_for_transaction_receipt(tx)
print("Allocation reduced by 100 Pi Base units")

# Slash 30%
tx = contract.functions.slash(participant, 30).transact({'from': owner_address})
w3.eth.wait_for_transaction_receipt(tx)
print("Participant slashed by 30%")

# Permanent ban (optional)
# tx = contract.functions.permanentBan(participant).transact({'from': owner_address})
# w3.eth.wait_for_transaction_receipt(tx)
# print("Participant permanently banned")
