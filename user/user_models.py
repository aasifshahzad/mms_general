from sqlmodel import SQLModel, Field, Enum, Column
from typing import Optional
from datetime import timedelta, datetime
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    TEACHER = "TEACHER"
    USER = "USER"
    ACCOUNTANT = "ACCOUNTANT"
    FEE_MANAGER = "FEE_MANAGER"
    PRINCIPAL = "PRINCIPAL"

class Token(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: timedelta

class TokenData(SQLModel):
    username: str
    exp: Optional[int] = None

class UserBase(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)


class UserLogin(SQLModel):
    username: str
    password: str
    grant_type: Optional[str] = "password"  # Default value
    scope: Optional[str] = ""
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

class UserUpdate(SQLModel):
    username: Optional[str] = None
    email: Optional[str] = None

class AdminUserUpdate(SQLModel):
    role: UserRole = Field(description="Must be one of: ADMIN, TEACHER, USER")

class User(UserBase, table=True):
    username: str = Field(nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    password: str = Field(nullable=False)
    role: UserRole = Field(default=UserRole.USER)

class UserCreate(SQLModel):
    username: str
    email: str
    password: str
    role: UserRole = UserRole.USER

class UserResponse(SQLModel):
    username: str
    email: str
    role: UserRole
    id: int

class LoginResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class RefreshToken(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(index=True, nullable=False)
    token: str = Field(nullable=False, unique=True)
    expires_at: datetime = Field(nullable=False)