import hashlib
import uuid
import json
from datetime import datetime
from app.blockchain.connector import log_violation
from app.db.mongo import db
def create_audit_log(action_data: dict, rule: dict):
    """
    Create an audit log entry for any action (ALLOWED or BLOCKED).

    action_data keys:
        actor        – registration_number of the person acting
        role         – their role (STUDENT / TEACHER / ADMIN)
        action_type  – e.g. MODIFY_MARKS
        decision     – "ALLOWED" or "BLOCKED"
        target       – (optional) registration_number of the affected student
    """
    try:
        log_id    = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        decision = action_data.get("decision", "BLOCKED")
        rule_id  = rule.get("rule_id",  "N/A") if rule else "N/A"
        severity = rule.get("severity", "N/A") if rule else "N/A"

        log_entry = {
            "log_id":      log_id,
            "timestamp":   timestamp,
            "actor":       str(action_data["actor"]),
            "role":        action_data["role"],
            "action_type": action_data["action_type"],
            "rule_id":     rule_id,
            "severity":    severity,
            "decision":    decision,
        }
        if "target" in action_data and action_data["target"] is not None:
            log_entry["target"] = str(action_data["target"])

        hash_input = json.dumps({
            "log_id":      log_id,
            "timestamp":   timestamp,
            "actor":       log_entry["actor"],
            "action_type": action_data["action_type"],
            "rule_id":     rule_id,
            "decision":    decision,
        }, sort_keys=True)

        hash_value = hashlib.sha256(hash_input.encode()).hexdigest()
        try:
            tx_data   = log_violation(hash_value, rule_id)
            tx_id     = tx_data["tx_id"]
            tx_hash   = tx_data["tx_hash"]
            log_status = "ON_CHAIN"
        except Exception as e:
            print("BLOCKCHAIN ERROR:", e)
            tx_id     = None
            tx_hash   = None
            log_status = "OFF_CHAIN"

        log_entry["hash"]        = hash_value
        log_entry["blockchain_tx"] = tx_id
        log_entry["tx_hash"]     = tx_hash
        log_entry["log_status"]  = log_status

        print("INSERTING AUDIT LOG:", log_entry)
        result = db["audit_logs"].insert_one(log_entry)
        print("MONGO INSERT SUCCESS:", result.inserted_id)

        return {
            "log_id":  log_id,
            "hash":    hash_value,
            "tx_id":   tx_id,
            "tx_hash": tx_hash,
            "status":  log_status,
        }

    except Exception as e:
        print("AUDIT SERVICE ERROR:", e)
        raise
