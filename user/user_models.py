from sqlmodel import SQLModel, Field, Enum, Column
from typing import Optional
from uuid import UUID
from datetime import timedelta
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    user = "user"

class Token(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: timedelta

class TokenData(SQLModel):
    username: str
    exp: Optional[int] = None

class UserBase(SQLModel):
    username: str = Field(nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    password: str = Field(nullable=False)

class UserLogin(SQLModel):
    username: str
    password: str

class UserUpdate(SQLModel):
    username: Optional[str] = None
    email: Optional[str] = None

class AdminUserUpdate(SQLModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None

class User(UserBase, table=True):
    id: UUID = Field(default=None, primary_key=True, index=True)
    role: UserRole = Field(
        default=UserRole.user,
        sa_column=Column("role", Enum(UserRole, native_enum=True))
    )

class UserCreate(SQLModel):
    username: str
    email: str
    password: str
    role: UserRole = UserRole.user

class UserResponse(SQLModel):
    username: str
    email: str
    role: UserRole
    id: UUID

class LoginResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse