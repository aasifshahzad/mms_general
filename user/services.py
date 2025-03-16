from jose import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from setting import *
from user.user_models import *
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from fastapi import HTTPException, status, Depends
from db import get_session
from typing import Annotated

from pydantic import EmailStr
from typing import Union, Any
# from main import oauth2_scheme

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password, hashed_password):
    """
    Verify the password using the hash stored in the database.
    Args:
        plain_password (str): The password entered by the user.
        hashed_password (str): The password stored in the database.
    Returns:
        bool: True if the password is correct, False otherwise.
    """
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

def get_user_by_username(db:Session,username:str) -> User:
    """
    Get the user by username.
    Args:
        db (Session): The database session.
        username (str): The username of the user.
    Returns:
        User: The user object.
        """
    if username is None:
        raise  HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,headers={"WWW-Authenticate": 'Bearer'},detail={"error": "invalid_token", "error_description": "The access token expired"})

    user = db.exec(select(User).where(User.username == username)).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="User not found")
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
        if datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise credentials_exception

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

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create an access token.
    Args:
        data (dict): The data to encode in the token.
        expires_delta (timedelta): The time delta for the token to expire.
    Returns:
        str: The access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

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

# def create_refresh_token(data: dict) -> str:
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(days=7)
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# @auth_router.post("/refresh")
# async def refresh_token(
#     refresh_token: str,
#     db: Session = Depends(get_session)
# ) -> Token:
#     try:
#         payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
#         username: str = payload.get("sub")
#         if username is None:
#             raise credentials_exception
#         user = get_user_by_username(db, username=username)
#         if user is None:
#             raise credentials_exception
#         access_token = create_access_token(data={"sub": user.username})
#         return Token(
#             access_token=access_token,
#             refresh_token=refresh_token
#         )
#     except JWTError:
#         raise credentials_exception