from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Import your User model so the type hint works
# from database import User 

load_dotenv()

# --- Config ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set") 
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")) 

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

class InvalidTokenError(Exception):
    pass

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    # Standard practice: 'sub' (subject) should be the username
    if "username" in to_encode:
        to_encode["sub"] = str(to_encode["username"])
        
    # Standard practice: 'id' should stay as 'id' for BOLA checks
    if "id" in to_encode:
        to_encode["id"] = to_encode["id"]
        
    if expires_delta is not None:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- The BOLA Shield Helper ---

def get_current_user_from_db(token: str, db):
    """
    Decodes the token and returns the full User database object.
    Used by main.py to verify ownership of personalized URLs.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        
        if username is None or user_id is None:
            raise InvalidTokenError("Token missing required identity claims")
        
        # We query by ID for maximum speed and accuracy
        from database import User # Local import to avoid circular imports
        user = db.query(User).filter(User.id == user_id).first()
        
        if user is None:
            raise InvalidTokenError("User no longer exists in sanctuary")
            
        return user
        
    except JWTError as exc:
        raise InvalidTokenError("Invalid token") from exc