

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db import create_db_and_tables, engine, get_session

from router.attendance_value import attendancevalue_router
from router.attendance_time import attendance_time_router
from router.teacher_names import teachernames_router
from router.class_names import classnames_router
from router.students import students_router
from router.mark_attendance import mark_attendance_router
from router.adm_del import adm_del_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Application")
    print("Creating database and tables")
    create_db_and_tables()
    print("Database and tables created")
    yield

app: FastAPI = FastAPI(
    lifespan=lifespan,
    title="MMS-GENERAL",
    description="This microservice includes all common settings and lists of fix contents",
    version="1.0.0",
    openapi_url="/docs/json",
    docs_url="/docs",
    redoc_url="/redoc",
    responses={404: {"Description": "MMS-GENERAL page not found :-("}},
)
origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Group all routers into a single one
main_router = APIRouter()

# Include the grouped router in the FastAPI app
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
