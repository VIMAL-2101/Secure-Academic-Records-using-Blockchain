from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["compliance_system"]

students_collection = db["students"]
teachers_collection = db["teachers"]
admins_collection = db["admins"]

audit_collection = db["audit_logs"]
records_collection = db["records"]