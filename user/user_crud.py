from datetime import timedelta
from uuid import uuid4
from jose import JWTError, jwt
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlmodel import Session, select
from db import get_session
from user.settings import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, REFRESH_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from user.services import create_access_token, get_password_hash, get_user_by_username, verify_password, pwd_context, oauth2_scheme
from user.user_models import (
    LoginResponse, 
    TokenData, 
    User, 
    UserCreate,
    UserLogin, 
    UserResponse, 
    UserUpdate,
    UserRole,
    AdminUserUpdate
)


def user_login(db: Session, form_data: UserLogin | OAuth2PasswordRequestForm) -> LoginResponse:
    username = form_data.username
    password = form_data.password
    
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = create_access_token(
        data={"sub": user.username}, expires_delta=refresh_token_expires
    )

    user_response = UserResponse(
        username=user.username,
        email=user.email,
        role=user.role,
        id=user.id
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(access_token_expires.total_seconds()),
        token_type="bearer",
        user=user_response
    )


async def signup_user(user: UserCreate, db: Session) -> User:
    """Create a new user with proper transaction handling."""
    try:
        # Convert role to uppercase and validate
        try:
            if isinstance(user.role, str):
                normalized_role = UserRole(user.role.upper())
            else:
                normalized_role = user.role
        except ValueError: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {user.role}. Must be one of: {[r.value for r in UserRole]}"
            )
        
        # Check existing email/username
        if db.exec(select(User).where(User.email == user.email)).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        if db.exec(select(User).where(User.username == user.username)).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
           
        # Create new user    
        new_user = User(
            id=uuid4(),
            username=user.username,
            email=user.email,
            password=get_password_hash(user.password),
            role=normalized_role
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
        
    except Exception as e:
        db.rollback()
        print(f"Error during signup: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

def update_user(user: UserUpdate, session: Session, current_user: User) -> User:
    updated_user = session.exec(select(User).where(User.id == current_user.id)).first()
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = user.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        value = value if key != "password" else pwd_context.hash(value)
        setattr(updated_user, key, value)
    session.commit()
    session.refresh(updated_user)
    return updated_user

def delete_user(session: Session, username: str) -> dict[str, str]:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"message": f"User {username} deleted successfully"}

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], 
    db: Annotated[Session, Depends(get_session)]
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def check_admin_or_teacher(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Check if user is either admin or teacher"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=403,
            detail="Only administrators and teachers can access this resource"
        )
    return current_user

# async def check_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
#     if user.role != UserRole.ADMIN:  # Compare with enum value
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,  # Use 403 for authorization failures
#             detail="Only administrators can perform this action"
#         )
#     return user
async def check_admin(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Check if user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can access this resource"
        )
    return current_user

async def check_authenticated_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Check if user is authenticated"""
    return current_user

async def admin_update_user(
    username: str,
    user_update: AdminUserUpdate, 
    db: Session,
    current_user: Annotated[User, Depends(check_admin)]
) -> User:
    """Update user role as admin"""
    
    # Find the user to update
    user_to_update = db.exec(select(User).where(User.username == username)).first()
    if not user_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"User {username} not found"
        )
    
    # Prevent admin from changing their own role
    if user_to_update.username == current_user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot change their own role"
        )
    
    try:
        # Convert role to enum (ensure it's uppercase)
        if isinstance(user_update.role, str):
            new_role = UserRole(user_update.role.upper())
        else:
            new_role = user_update.role

        # Update the user's role
        user_to_update.role = new_role
        db.commit()
        db.refresh(user_to_update)
        return user_to_update
        
    except Exception as e:
        db.rollback()
        print(f"Error updating role: {str(e)}")  # Debugging info
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user role: {str(e)}"
        )
