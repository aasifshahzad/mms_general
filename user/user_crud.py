from datetime import timedelta
from uuid import uuid4
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from db import get_session
from user.settings import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, REFRESH_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from user.services import create_access_token, get_password_hash, get_user_by_username, verify_password, pwd_context, oauth2_scheme
from user.user_models import TokenData, User, UserCreate, UserUpdate, Userlogin
from typing import Annotated

  # Assuming security functions exist

def user_login(db: Session, form_data: OAuth2PasswordRequestForm):
    user: Userlogin = get_user_by_username(db, form_data.username)
    
    if not user or not verify_password(form_data.password, user.password):
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

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": access_token_expires.total_seconds() + refresh_token_expires.total_seconds(),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email if hasattr(user, "email") else None,
            "role": user.role if hasattr(user, "role") else None,
        }
    }



# def publish_user_signup(user_data: User):
#     with DaprClient() as d:
#         user_message = user_pb2.User(
#             username=user_data.username,
#             email=user_data.email,
#         )
#         d.publish_event(
#             pubsub_name=settings.KAFKA_GROUP_ID,
#             topic_name=settings.KAFKA_PRODUCER_TOPIC,
#             data=user_message.SerializeToString(),
#             data_content_type='application/json',
#         )
        
#     print(f"Published user signup event for {user_data.username}")

async def signup_user(user: UserCreate, db: Session) -> User:
    """
    Create a new user.
    Args:
        user (UserCreate): The user data.
        db (re(User.username == user.username)).first()
    if search_user_by_username:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Try Different username")
    
    hashed_password = get_password_hash(user.password)

    new_user = User(id = uuid4(), username=user.username, email=user.email, password=hashed_password, role=user.role)
    # user = user_pb2.User(
    #     username=new_user.username,
    #     email=new_user.email,
    # )
    # serialized_user = user.SerializeToString()
    # await producer.send_and_wait(settings.KAFKA_PRODUCER_TOPIC, serialized_user)
    # # publish_user_signup(new_user)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def update_user(user: UserUpdate, session: Session, current_user: User) -> Userlogin:
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

def delete_user(session: Session, username: str) -> User:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"message": f"User {username} deleted successfully"}

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_session)]) -> User:
    """
    Get the current user.
    Args:
        token (str): The access token.
        db (Session): The database session.
    Returns:
        User: The user object.
    """
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

async def check_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    """
    Check if the user is an admin.
    Args:
        user (User): The user object.
    Returns:
        User: The user object.
    """
    if user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="User not authorized to perform this action")
    return user

def check_teacher(current_user: User):
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=403, 
            detail="Only teachers and administrators can access this resource"
        )
    return current_user
