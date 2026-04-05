from web3 import Web3
import json
import uuid
import os
from pathlib import Path
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BLOCKCHAIN_RPC = os.getenv("BLOCKCHAIN_RPC")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
WALLET_ADDRESS = os.getenv("WALLET_ADDRESS")

if not BLOCKCHAIN_RPC or not CONTRACT_ADDRESS or not PRIVATE_KEY or not WALLET_ADDRESS:
    raise Exception("Missing blockchain environment variables")

w3 = Web3(Web3.HTTPProvider(BLOCKCHAIN_RPC))

if not w3.is_connected():
    raise Exception("Blockchain connection failed")

logger.info("Connected to blockchain")

contract_address = Web3.to_checksum_address(CONTRACT_ADDRESS)

BASE_DIR = Path(__file__).resolve().parent

ABI_PATH = (
    BASE_DIR.parent.parent
    / "blockchain_contract"
    / "artifacts"
    / "contracts"
    / "AuditLog.sol"
    / "AuditLog.json"
)

with open(ABI_PATH) as f:
    contract_json = json.load(f)

abi = contract_json["abi"]

contract = w3.eth.contract(address=contract_address, abi=abi)

def log_violation(hash_value, rule_id):
    """
    Stores audit hash on blockchain
    Returns:
        dict or None (if blockchain fails)
    """
    try:
        tx_id = str(uuid.uuid4())

        account = Web3.to_checksum_address(WALLET_ADDRESS)

        nonce = w3.eth.get_transaction_count(account)

        txn = contract.functions.storeLog(
            tx_id,
            hash_value,
            rule_id
        ).build_transaction({
            "from": account,
            "nonce": nonce,
            "gas": 2000000,
            "gasPrice": w3.to_wei("20", "gwei"),
            "chainId": 1337
        })

        signed_txn = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)

        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

        tx_hash_hex = tx_hash.hex()

        logger.info(f"Blockchain TX SUCCESS: {tx_hash_hex}")
        logger.info(f"Log TX_ID: {tx_id}")

        return {
            "tx_id": tx_id,
            "tx_hash": tx_hash_hex
        }

    except Exception as e:
        logger.error(f"Blockchain error: {str(e)}")
        return None

def get_onchain_hash(tx_id):
    """
    Fetch stored hash from blockchain using tx_id
    """
    try:
        if not tx_id:
            return None

        stored_hash = contract.functions.getLog(tx_id).call()
        return stored_hash

    except Exception as e:
        logger.error(f"Fetch error: {str(e)}")
        return None
    