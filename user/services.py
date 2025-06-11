from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Annotated, Optional
from fastapi.openapi.models import OAuthFlows
from fastapi.openapi.models import OAuthFlowPassword
from fastapi.security import OAuth2PasswordBearer
from setting import *
from user.settings import *
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from fastapi import HTTPException, status, Depends
from db import get_session
from typing import Annotated

from pydantic import EmailStr
from typing import Union, Any
from user.user_models import User  # Import the User model


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Update OAuth2 scheme to use correct path
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login-swagger")  


def verify_password(plain_password, hashed_password):
    """Verify the password using the hash stored in the database."""
    if not plain_password or not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Hash the password before storing it in the database.
    Args:
        password (str): The password entered by the user.
    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)

def get_user_by_username(db: Session, username: str) -> User:
    """Get the user by username."""
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
            detail="Invalid credentials"
        )

    user = db.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def get_user_by_id(db: Session, userid: int) -> User:
    """
    Get the user by user id.
    Args:
        db (Session): The database session.
        userid (int): The user id.
    Returns:
        User: The user object.
        """
    if userid is None:
        raise  HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                             headers={"WWW-Authenticate": 'Bearer'},
                             detail={"error": "invalid_token", "error_description": "The access token expired"})
    user = db.get(User, userid)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="User not found")
    
    return user

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], 
    db: Annotated[Session, Depends(get_session)]
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        exp = payload.get("exp")
        
        if username is None:
            raise credentials_exception
            
        # Check token expiration
        if datetime.now().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
)


def get_user_by_email(db:Session,user_email: EmailStr) -> User:
    """
    Get the user by email.
    Args:
        db (Session): The database session.
        user_email (EmailStr): The email of the user.
    Returns:
        User: The user object.
    """
    if user_email is None:
        raise  HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,headers={"WWW-Authenticate": 'Bearer'},detail={"error": "invalid_token", "error_description": "The access token expired"})

    user = db.get(User, user_email)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="User not found")
    return user

def authenticate_user(db, username: str, password: str) -> User:
    """
    Authenticate the user.
    Args:
        db (Session): The database session.
        username (str): The username of the user.
        password (str): The password of the user.
    Returns:
        User: The user object.
    """
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token with expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    try:
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating access token: {str(e)}"
        )

def create_refresh_token(data: Union[str, Any], expires_delta: int = None) -> str:

    """
    Create a refresh token.
    Args:
        data (Union[str, Any]): The data to encode in the token.
        expires_delta (int): The time delta for the token to expire.
    Returns:
        str: The refresh token.
    """
    if expires_delta is not None:
        expires_delta = datetime.now() + expires_delta
    else:
        expires_delta = datetime.now() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expires_delta, "sub": str(data)}
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt

def verify_refresh_token(db: Session, token: str) -> User:
    """
    Validates the refresh token and returns the associated user if valid.
    """
    try:
        payload = jwt.decode(token, JWT_REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Check if the token exists in the database
        stored_token = db.exec(select(RefreshToken).where(RefreshToken.token == token)).first()
        if not stored_token or stored_token.expires_at < datetime.now():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or invalid")

        return get_user_by_username(db, user_id)

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def revoke_refresh_token(db: Session, token: str):
    """
    Revokes a refresh token (used for logout).
    """
    stored_token = db.exec(select(RefreshToken).where(RefreshToken.token == token)).first()
    if stored_token:
        db.delete(stored_token)
        db.commit()

def verify_token(token: str):
    try:
        return jwt.decode(token, JWT_REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None