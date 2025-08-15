from fastapi import FastAPI, Depends, HTTPException, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import select, Session, SQLModel
from typing import Annotated
from contextlib import asynccontextmanager
from utils.logging import logger, cleanup_old_logs
from db import engine, SessionLocal, lifespan
import asyncio
from fastapi.openapi.utils import get_openapi

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
from router.admin_create_user import admin_create_user_router

# User related imports
from user.user_router import public_router, user_router, admin_router

from db import get_session, create_db_and_tables



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

origins = [
    "http://localhost:3000",  # Next.js development server
    "https://mzbs.vercel.app"  # Production frontend
]

app = FastAPI(
    title="MMS-GENERAL", 
    description="Manages all API for MMS-GENERAL",
    version="0.1.0",
    # openapi_url="/docs/json",
    # docs_url="/docs",
    # redoc_url="/redoc",
    lifespan=lifespan,
)



logger.info("Starting application...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]  # Expose all headers
)

# Include routers
app.include_router(public_router)  # No prefix - routes will be at /login and /signup
app.include_router(user_router)    # Routes will be at /auth/*
app.include_router(admin_router)   # Routes will be at /admin/users/*
app.include_router(admin_create_user_router)
app.include_router(income_cat_names_router)
app.include_router(expense_cat_names_router)
app.include_router(attendancevalue_router)
app.include_router(attendance_time_router)
app.include_router(teachernames_router)
app.include_router(classnames_router)
app.include_router(dashboard_router, tags=["Dashboard"])
app.include_router(expense_router)
app.include_router(fee_router)
app.include_router(income_router)
app.include_router(students_router)
app.include_router(mark_attendance_router)
app.include_router(adm_del_router)

@app.get("/", tags=["MMS Backend"])
async def root():
    return {"Message": "MMS Backend is running :-}"}

