from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.mongo import db
SECRET_KEY = "SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
def hash_password(password: str):
    return pwd_context.hash(password)
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise Exception("Invalid token")
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        reg_no = int(payload.get("sub") or payload.get("registration_number"))
        role = payload.get("role", "").upper()

        if not reg_no:
            raise Exception("Invalid token payload")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    collection_map = {
        "STUDENT": "students",
        "TEACHER": "teachers",
        "ADMIN": "admins",
    }
    collection = collection_map.get(role)
    if not collection:
        raise HTTPException(status_code=401, detail="Unknown role in token")

    user = db[collection].find_one({"registration_number": reg_no}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["role"] = role
    return user