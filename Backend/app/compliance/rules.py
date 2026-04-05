RULES = {

    "DELETE_ACADEMIC_RECORD": {
        "rule_id": "RULE_001",
        "description": "Only ADMIN can delete academic records",
        "severity": "CRITICAL",
        "allowed_roles": ["ADMIN"]
    },

    "MODIFY_MARKS": {
        "rule_id": "RULE_002",
        "description": "Only TEACHER or ADMIN can modify marks",
        "severity": "HIGH",
        "allowed_roles": ["TEACHER", "ADMIN"]
    },

    "UPDATE_ATTENDANCE": {
        "rule_id": "RULE_003",
        "description": "Only TEACHER or ADMIN can update attendance",
        "severity": "HIGH",
        "allowed_roles": ["TEACHER", "ADMIN"]
    },


    "REGISTER_EXAM": {
        "rule_id": "RULE_004",
        "description": "Students can register for exams",
        "severity": "MEDIUM",
        "allowed_roles": ["STUDENT"]
    },

    "APPROVE_RESULTS": {
        "rule_id": "RULE_005",
        "description": "Only ADMIN can approve final results",
        "severity": "CRITICAL",
        "allowed_roles": ["ADMIN"]
    },

    "VIEW_MARKS": {
        "rule_id": "RULE_006",
        "description": "Students, Teachers, Admin can view marks",
        "severity": "LOW",
        "allowed_roles": ["STUDENT", "TEACHER", "ADMIN"]
    },

    "UPLOAD_ASSIGNMENT": {
        "rule_id": "RULE_007",
        "description": "Only TEACHER can upload assignments",
        "severity": "MEDIUM",
        "allowed_roles": ["TEACHER"]
    },

    "CREATE_STUDENT_ACCOUNT": {
        "rule_id": "RULE_008",
        "description": "Only ADMIN can create new student accounts",
        "severity": "CRITICAL",
        "allowed_roles": ["ADMIN"]
    }
}