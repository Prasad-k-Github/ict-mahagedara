"""
Authentication Module
Handles user registration, login, password hashing, and JWT token generation
"""

import bcrypt
from datetime import datetime, timedelta, date
from typing import Optional
import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field, validator
import os
from dotenv import load_dotenv

from database import User, get_db

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Security
security = HTTPBearer()

# Pydantic Models
class UserRegister(BaseModel):
    """User registration request"""
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    phone_number: str = Field(..., min_length=10, max_length=20)
    birthday: date = Field(...)
    gender: str = Field(...)
    grade_level: int = Field(..., ge=1, le=12)
    language: str = Field(...)
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str = Field(..., min_length=6, max_length=100)
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip().title()
    
    @validator('phone_number')
    def validate_phone(cls, v):
        # Remove spaces and dashes
        cleaned = v.replace(' ', '').replace('-', '')
        if not cleaned.isdigit():
            raise ValueError("Phone number must contain only digits")
        if len(cleaned) < 10:
            raise ValueError("Phone number must be at least 10 digits")
        return cleaned
    
    @validator('birthday')
    def validate_birthday(cls, v):
        if not isinstance(v, date):
            raise ValueError("Invalid date format")
        # Check if age is reasonable (between 5 and 100 years)
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 5:
            raise ValueError("User must be at least 5 years old")
        if age > 100:
            raise ValueError("Invalid birth date")
        if v > today:
            raise ValueError("Birth date cannot be in the future")
        return v
    
    @validator('gender')
    def validate_gender(cls, v):
        allowed_genders = ['Male', 'Female']
        if v not in allowed_genders:
            raise ValueError(f"Gender must be one of: {', '.join(allowed_genders)}")
        return v
    
    @validator('language')
    def validate_language(cls, v):
        allowed_languages = ['Sinhala', 'English', 'Tamil']
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {', '.join(allowed_languages)}")
        return v
    
    @validator('confirm_password')
    def validate_passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError("Passwords do not match")
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v

class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    email: str

class UserResponse(BaseModel):
    """User information response"""
    id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    birthday: date
    gender: str
    grade_level: int
    language: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

# Password Hashing Functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Convert password to bytes and generate salt
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string for database storage
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # Convert both to bytes
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    # Compare
    return bcrypt.checkpw(password_bytes, hashed_bytes)

# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Authentication Functions
def register_user(user_data: UserRegister, db: Session) -> User:
    """Register a new user"""
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone number exists
    existing_phone = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create new user
    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        phone_number=user_data.phone_number,
        birthday=user_data.birthday,
        gender=user_data.gender,
        grade_level=user_data.grade_level,
        language=user_data.language,
        hashed_password=hashed_pwd,
        created_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

def authenticate_user(email: str, password: str, db: Session) -> Optional[User]:
    """Authenticate a user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    return user
