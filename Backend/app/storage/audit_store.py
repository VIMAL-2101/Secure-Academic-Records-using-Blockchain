import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
LOG_FILE = BASE_DIR / "audit_logs.json"


def save_log(log_entry: dict):

    if not LOG_FILE.exists():
        with open(LOG_FILE, "w") as f:
            json.dump([], f)

    with open(LOG_FILE, "r") as f:
        logs = json.load(f)

    logs.append(log_entry)

    with open(LOG_FILE, "w") as f:
        json.dump(logs, f, indent=4)


def get_log(log_id: str):

    if not LOG_FILE.exists():
        return None

    with open(LOG_FILE, "r") as f:
        logs = json.load(f)

    for log in logs:
        if log["log_id"] == log_id:
            return log

    return None

STUDENTS_FILE = BASE_DIR / "students.json"


def load_students():

    if not STUDENTS_FILE.exists():
        return []

    with open(STUDENTS_FILE, "r") as f:
        return json.load(f)


def save_students(students):

    with open(STUDENTS_FILE, "w") as f:
        json.dump(students, f, indent=4)


def modify_marks(registration_number, course, marks):

    students = load_students()

    for student in students:
        if student["registration_number"] == registration_number:
            student["marks"][course] = marks
            save_students(students)
            return True

    return False

def update_attendance(registration_number, course, attendance):

    students = load_students()

    for student in students:
        if student["registration_number"] == registration_number:
            student["attendance"][course] = attendance
            save_students(students)
            return True

    return False

def approve_result(registration_number):

    students = load_students()

    for student in students:
        if student["registration_number"] == registration_number:
            student["result_status"] = "APPROVED"
            save_students(students)
            return True

    return False

