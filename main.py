from fastapi import FastAPI, Depends, HTTPException, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlmodel import select, Session, SQLModel
from typing import Annotated
from contextlib import asynccontextmanager
from utils.logging import logger, cleanup_old_logs
from db import engine, SessionLocal, lifespan
import asyncio

# Router imports
from router.attendance_value import attendancevalue_router
from router.attendance_time import attendance_time_router
from router.teacher_names import teachernames_router
from router.class_names import classnames_router
from router.students import students_router
from router.mark_attendance import mark_attendance_router
from router.adm_del import adm_del_router
from router.fee import fee_router
from router.income import income_router
from router.income_cat_names import income_cat_names_router
from router.expense_cat_names import expense_cat_names_router
from router.expense import expense_router
from router.dashboard import dashboard_router


# User related imports
from user.user_crud import (
    user_login, 
    delete_user, 
    signup_user,
    get_current_user, 
    check_admin, 
    update_user
)
from db import *
from user.services import *
from user.user_models import *



@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🔹 Startup Tasks
    print("Starting Application")
    print("Creating database and tables")
    create_db_and_tables()
    print("Database and tables created")

    logger.info("Starting application...")
    try:
        cleanup_old_logs()
        logger.info("Log cleanup process completed")
    except Exception as e:
        logger.error(f"Failed to clean up logs: {str(e)}")

    yield  # 🔸 Application Runs Here

    # 🔹 Shutdown Tasks
    logger.info("Application shutting down...")
    try:
        await engine.dispose()  # Close database connections
        
        # Cancel any pending tasks
        for task in asyncio.all_tasks():
            if not task.done():
                task.cancel()

        logger.info("Shutdown completed successfully")
    except Exception as e:
        logger.error(f"Shutdown error: {str(e)}")

origins = ["http://localhost:3000","https://mzbs.vercel.app"]

app = FastAPI(
    title="MMS-GENERAL", 
    description="Manages all API for MMS-GENERAL",
    version="0.1.0",
    # openapi_url="/docs/json",
    # docs_url="/docs",
    # redoc_url="/redoc",
    lifespan=lifespan,
    root_path="/auth",
    responses={404: {"Description": "MMS-GENERAL page not found :-("}},
)

logger.info("Starting application...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  # Specify needed methods
    allow_headers=["Authorization", "Content-Type"],  # Specify needed headers
)

# Include the grouped router in the FastAPI app
app.include_router(dashboard_router, tags=["Dashboard"])
app.include_router(expense_cat_names_router)
app.include_router(expense_router)
app.include_router(fee_router)
app.include_router(income_router)
app.include_router(income_cat_names_router)
app.include_router(attendancevalue_router)
app.include_router(attendance_time_router)
app.include_router(teachernames_router)
app.include_router(classnames_router)
app.include_router(students_router)
app.include_router(mark_attendance_router)
app.include_router(adm_del_router)

@app.get("/", tags=["MMS Backend"])
async def root():
    return {"Message": "MMS Backend is running :-}"}


@app.post("/login", response_model=LoginResponse, tags=["User"])
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_session)]
) -> LoginResponse:
    return user_login(db, form_data)

@app.post("/frontend/login", response_model=LoginResponse, tags=["User"])
# @app.post("/auth/login", response_model=LoginResponse, tags=["User"])
async def login_for_frontend(
    login_data: UserLogin,
    db: Session = Depends(get_session)
):
    return user_login(db, login_data)
@app.post("/signup", response_model=User, tags=["User"])

async def signup(
    db: Annotated[Session, Depends(get_session)], 
    user: UserCreate
):
    try:
        return await signup_user(user, db)
    except HTTPException as e:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during signup: {str(e)}"
        )

@app.get("/users/me", response_model=User, tags=["User"])
async def read_users_me(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_session)]) -> User:
    user = await get_current_user(token, db)
    return user

@app.patch("/auth/update-user", response_model=User, tags=["User"])
async def update_user_endpoint(
    user: UserUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    updated_user = update_user(user, session, current_user)
    return updated_user

@app.delete("/delete-user", response_model=User, tags=["User"])
def user_delete(session: Annotated[Session, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    delete_user(session, current_user.username)
    return {"message": "User deleted successfully"}

@app.get("/users", response_model=list[User], tags=["Admin"])
def read_users(db: Annotated[Session, Depends(get_session)], user: Annotated[User, Depends(check_admin)]) -> list[User]:
    return db.exec(select(User)).all()

@app.delete("/delete-user/{username}", response_model=User, tags=["Admin"])
def user_delete(session: Annotated[Session, Depends(get_session)], username: str, user: Annotated[User, Depends(check_admin)]):
    delete_user(session, username)
    return {"message": "User deleted successfully"}

@app.patch("/update-user/{username}", response_model=User, tags=["Admin"])
def update_user_roll(username: str, user: AdminUserUpdate, session: Session = Depends(get_session), current_user: User = Depends(check_admin)):
    # Find the user by username
    db_user = session.exec(select(User).where(User.username == username)).first()
    
    # Raise an exception if user not found
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields, excluding unset values
    user_dict_data = user.model_dump(exclude_unset=True)
    for key, value in user_dict_data.items():
        setattr(db_user, key, value)
    
    # Add and commit changes
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@app.post("/refresh", response_model=LoginResponse, tags=["User"])
async def refresh_access_token(
    refresh_token: str = Cookie(None),  # Refresh token from HTTP-only cookie
    db: Session = Depends(get_session)
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    # Generate new access token
    new_access_token = create_access_token(
        data={"sub": username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.post("/logout", tags=["User"])
async def logout(
    refresh_token: str = Cookie(None),  # Refresh token from HTTP-only cookie
    db: Session = Depends(get_session)
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No refresh token provided"
        )
    
    try:
        revoke_refresh_token(db, refresh_token)
        return {"message": "User logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during logout: {str(e)}"
        )
    
