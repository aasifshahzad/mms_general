from asyncio.log import logger
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from general.db import get_session
from schemas.attendance_time_model import AttendanceTime, AttendanceTimeCreate, AttendanceTimeResponse
attendance_time_router = APIRouter(
    prefix="/attendance_time",
    tags=["Attendance Time"],
    responses={404: {"Description": "Not found"}}
)


@attendance_time_router.get("/", response_model=dict)
async def root():
    return {"message": "MMS-General service is running", "status": "Attendance Time Router Page running :-)"}


@attendance_time_router.post("/add_attendance_value/", response_model=AttendanceTimeResponse)
def create_attendance_time(attendance_time: AttendanceTimeCreate, session: Session = Depends(get_session)):
    db_attendance_time = AttendanceTime(**attendance_time.model_dump())
    session.add(db_attendance_time)

    try:
        session.commit()
        session.refresh(db_attendance_time)
    except Exception as e:
        session.rollback()
        # Log any other unexpected errors
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail="Attendance value must be unique."
        )

    return db_attendance_time

# # Returns all placed attendance_times


@attendance_time_router.get("/attendance-values-all/", response_model=List[AttendanceTimeResponse])
def read_attendance_times(session: Session = Depends(get_session)):
    attendance_times = session.exec(select(AttendanceTime)).all()
    return attendance_times

# # Returns attendance_time of any specific attendance_time-id


@attendance_time_router.get("/{attendance_time_id}", response_model=AttendanceTimeResponse)
def read_attendance_time(attendance_time_id: int, session: Session = Depends(get_session)):
    attendance_time = session.get(AttendanceTime, attendance_time_id)
    if not attendance_time:
        raise HTTPException(
            status_code=404, detail="Attendance_time not found")
    return attendance_time


@attendance_time_router.delete("/del/{attend_value_name}", response_model=dict)
def delete_attendance_time(attend_value_name: str, session: Session = Depends(get_session)):
    attendance_time = session.exec(select(AttendanceTime).where(
        AttendanceTime.attendance_time == attend_value_name)).first()
    print(attendance_time)
    if not attendance_time:
        raise HTTPException(
            status_code=404, detail="Attendance Time not found")
    session.delete(attendance_time)
    session.commit()
    return {"message": "Attendance Time deleted successfully"}
