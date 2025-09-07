from fastapi import APIRouter, Depends, HTTPException, Cookie, Response, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta

from .user_models import (
    User, UserCreate, UserUpdate, UserResponse, 
    LoginResponse, AdminUserUpdate, UserLogin
)
from .user_crud import (
    user_login, delete_user, signup_user,
    get_current_user, check_admin, update_user
)
from .services import (
    verify_token, create_access_token,
    revoke_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES
)
from db import get_session
from typing import Annotated, List

# Create separate routers for auth and public endpoints
public_router = APIRouter(
    tags=["Public"]
)

user_router = APIRouter(
    prefix="/auth",
    tags=["User"]
)

admin_router = APIRouter(
    prefix="/admin/users",
    tags=["Admin"]
)

# Update tokenUrl to remove auth prefix
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login-swagger")

# Public routes (no auth prefix)
@public_router.post("/login-swagger", response_model=LoginResponse)
async def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session)
):
    return user_login(db, form_data)

@public_router.post("/login", response_model=LoginResponse)
async def login_for_frontend(
    response: Response,
    login_data: UserLogin,
    db: Session = Depends(get_session)
):
    """Login endpoint for frontend clients"""
    try:
        login_response = user_login(db, login_data)
        
        # Set HTTP-only cookies for tokens
        response.set_cookie(
            key="refresh_token",
            value=login_response.refresh_token,
            httponly=True,
            secure=True,  # Enable in production
            samesite="lax",
            max_age=60 * 60 * 24 * 7  # 7 days
        )

        return login_response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@public_router.post("/signup", response_model=UserResponse)
async def signup(
    user_data: UserCreate,
    db: Session = Depends(get_session)
):
    """Create new user account"""
    try:
        # Check existing user
        existing_user = db.exec(
            select(User).where(
                (User.username == user_data.username) | 
                (User.email == user_data.email)
            )
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )

        # Create user
        new_user = await signup_user(user_data, db)
        return UserResponse(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            role=new_user.role
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )

# Protected routes (keep auth prefix)
@user_router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)]
):
    return current_user

@user_router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_session)
):
    """Logout user and clear tokens"""
    try:
        if refresh_token:
            await revoke_refresh_token(db, refresh_token)
        
        # Clear cookies
        response.delete_cookie(key="refresh_token")
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )
        

@public_router.post("/signup/bulk", response_model=List[UserResponse])
async def bulk_signup(
    users_data: List[UserCreate],
    db: Session = Depends(get_session)
):
    """Create multiple user accounts at once"""
    created_users = []
    try:
        for user_data in users_data:
            # Check if user already exists
            existing_user = db.exec(
                select(User).where(
                    (User.username == user_data.username) |
                    (User.email == user_data.email)
                )
            ).first()

            if existing_user:
                # Skip existing user (or raise error if you want strict behavior)
                continue

            # Create user
            new_user = await signup_user(user_data, db)
            created_users.append(
                UserResponse(
                    id=new_user.id,
                    username=new_user.username,
                    email=new_user.email,
                    role=new_user.role
                )
            )

        if not created_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No new users created (all already exist)."
            )

        return created_users

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk signup failed: {str(e)}"
        )


@user_router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    refresh_token: str = Cookie(None),
    response: Response = None,
    db: Session = Depends(get_session)
):
    """Refresh access token using refresh token"""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided"
        )

    try:
        # Verify the refresh token
        payload = verify_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Get username from token
        username = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        # Get user from database
        user = get_user_by_username(db, username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role
            )
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not refresh token: {str(e)}"
        )

# Admin routes
@admin_router.get("/", response_model=list[User])
def read_users(
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_admin)]
) -> list[User]:
    return db.exec(select(User)).all()

# ... Add all other admin routes from main.py ...