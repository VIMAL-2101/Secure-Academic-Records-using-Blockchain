import json
from app.core.security import hash_password

teachers = []
admins = []


for i in range(1, 11):
    teacher = {
        "registration_number": 90000 + i,
        "name": f"Teacher_{i}",
        "department": "CSE",
        "password_hash": hash_password("teacher123"),
        "role": "TEACHER"
    }
    teachers.append(teacher)



for i in range(1, 6):
    admin = {
        "registration_number": 99000 + i,
        "name": f"Admin_{i}",
        "department": "Administration",
        "password_hash": hash_password("admin123"),
        "role": "ADMIN"
    }
    admins.append(admin)



with open("teachers.json", "w") as f:
    json.dump(teachers, f, indent=4)



with open("admins.json", "w") as f:
    json.dump(admins, f, indent=4)


print("Teachers and Admins generated successfully.")