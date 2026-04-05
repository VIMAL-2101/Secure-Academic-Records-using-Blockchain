import json
from app.core.security import hash_password
import random

students = []

start_reg = 20210001

for i in range(50):
    reg_no = start_reg + i

    student = {
        "registration_number": reg_no,
        "name": f"Student_{i+1}",
        "department": "CSE",
        "year": 3,
        "password_hash": hash_password("student123"),
        "role": "STUDENT",
        "marks": {
            "CSE401": random.randint(60, 90)
        },
        "attendance": {
            "CSE401": random.randint(65, 95)
        },
        "result_status": "PENDING"
    }

    students.append(student)

with open("students.json", "w") as f:
    json.dump(students, f, indent=4)

print("50 students generated successfully.")