from app.db.mongo import db
def find_user_by_reg_no(reg_no: int):
    user = db["students"].find_one({"registration_number": reg_no})
    if user:
        user["role"] = "STUDENT"
        return user
    user = db["teachers"].find_one({"registration_number": reg_no})
    if user:
        user["role"] = "TEACHER"
        return user
    user = db["admins"].find_one({"registration_number": reg_no})
    if user:
        user["role"] = "ADMIN"
        return user
    return None