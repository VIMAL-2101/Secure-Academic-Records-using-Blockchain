from app.compliance.rules import RULES
_ALLOWED_RULE = {"rule_id": "N/A", "severity": "N/A"}
def evaluate(action_type: str, role: str):
    rule = RULES.get(action_type)
    if not rule:
        return {"status": "ALLOWED", "rule": _ALLOWED_RULE}

    if role not in rule.get("allowed_roles", []):
        return {
            "status": "VIOLATION",
            "rule":   rule,
            "reason": f"{role} not permitted for {action_type}",
        }
    return {"status": "ALLOWED", "rule": rule}
