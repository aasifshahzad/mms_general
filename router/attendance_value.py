from sqlalchemy import text
from asyncio.log import logger
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from schemas.attendance_value_model import AttendanceValue, AttendanceValueCreate, AttendanceValueResponse
from user.user_crud import check_admin
from user.user_models import User
attendancevalue_router = APIRouter(
    prefix="/attendance_value",
    tags=["Attendance Value"],
    responses={404: {"Description": "Not found"}}
)


@attendancevalue_router.get("/", response_model=dict)
async def root():
    return {"message": "MMS-General service is running", "status": "Attendance Value Router Page running :-)"}


@attendancevalue_router.post("/add_attendance_value/", response_model=AttendanceValueResponse)
def create_attendancevalue(user: Annotated[User, Depends(check_admin)],attendancevalue: AttendanceValueCreate, session: Session = Depends(get_session)):
    db_attendancevalue = AttendanceValue(**attendancevalue.model_dump())
    session.add(db_attendancevalue)

    try:
        session.commit()
        session.refresh(db_attendancevalue)
    except Exception as e:
        session.rollback()
        # Log any other unexpected errors
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail="Attendance value must be unique."
        )

    return db_attendancevalue

# # Returns all placed attendancevalues


@attendancevalue_router.get("/attendance-values-all/", response_model=List[AttendanceValueResponse])
def read_attendancevalues(session: Session = Depends(get_session)):
    attendancevalues = session.exec(select(AttendanceValue)).all()
    return attendancevalues

# # Returns attendancevalue of any specific attendancevalue-id


@attendancevalue_router.get("/{attendancevalue_id}", response_model=AttendanceValueResponse)
def read_attendancevalue(attendancevalue_id: int, session: Session = Depends(get_session)):
    attendancevalue = session.get(AttendanceValue, attendancevalue_id)
    if not attendancevalue:
        raise HTTPException(
            status_code=404, detail="Attendancevalue not found")
    return attendancevalue


@attendancevalue_router.delete("/del/{attend_value_name}", response_model=dict)
def delete_attendancevalue(user: Annotated[User, Depends(check_admin)],attend_value_name: str, session: Session = Depends(get_session)):
    attendancevalue = session.exec(select(AttendanceValue).where(
        AttendanceValue.attendance_value == attend_value_name)).first()
    print(attendancevalue)
    if not attendancevalue:
        raise HTTPException(
            status_code=404, detail="Attendance Value not found")
    session.delete(attendancevalue)
    session.commit()
    return {"message": "Attendance Value deleted successfully"}


@attendancevalue_router.post("/reset_attendance_id", response_model=str)
def reset_attendance_id(session: Session = Depends(get_session)):
    # Delete all attendance records
    session.exec(select(AttendanceValue)).all()  # Fetch all records
    # Adjust the table name as necessary
    session.exec("DELETE FROM attendancevalue")
    session.commit()

    # Reset the sequence (if using PostgreSQL)
    # Adjust the sequence name as necessary
    session.exec("ALTER SEQUENCE attendance_attendance_id_seq RESTART WITH 1")
    session.commit()

    return "Attendance IDs have been reset to start from 1."


