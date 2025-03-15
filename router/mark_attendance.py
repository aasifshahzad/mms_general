from schemas.attendance_model import (
    Attendance,
    AttendanceCreate,
    AttendanceTime,
    AttendanceUpdate,
    BulkAttendanceCreate,
    ClassNames,
    FilteredAttendanceResponse,
    TeacherNames,
    Students,
    AttendanceValue,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Annotated, List, Optional

from db import get_session
from user.user_crud import check_teacher
from user.user_models import User

mark_attendance_router = APIRouter(
    prefix="/mark_attendance",
    tags=["Mark Attendance"],
    responses={404: {"description": "Marking Attendance of Students"}}
)

@mark_attendance_router.get("/show_all_attendance", response_model=List[FilteredAttendanceResponse])
def get_filtered_attendance(
    session: Session = Depends(get_session)):
    stmt = (
        select(
            Attendance.attendance_id,
            Attendance.attendance_date,
            AttendanceTime.attendance_time,
            ClassNames.class_name,
            TeacherNames.teacher_name,
            Students.student_name,
            Students.father_name,
            AttendanceValue.attendance_value,
        )
        .join(Attendance.attendance_time)
        .join(Attendance.attendance_class)
        .join(Attendance.attendance_teacher)
        .join(Attendance.attendance_student)
        .join(Attendance.attendance_value)
    )

    result = session.exec(stmt).all()

    if not result:
        raise HTTPException(status_code=404, detail="No attendance records found")

    return [
        {
            "attendance_id": attendance_id,
            "attendance_date": attendance_date,
            "attendance_time": attendance_time,
            "attendance_class": class_name,
            "attendance_teacher": teacher_name,
            "attendance_student": student_name,
            "attendance_std_fname": father_name,
            "attendance_value": attendance_value,
        }
        for attendance_id, attendance_date, attendance_time, class_name, teacher_name, student_name, father_name, attendance_value in result
    ]

@mark_attendance_router.post("/add_attendance/", response_model=FilteredAttendanceResponse)
def add_attendance(create_attendance: AttendanceCreate, session: Session = Depends(get_session)):
    student = session.get(Students, create_attendance.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with ID {create_attendance.student_id} not found")

    db_attendance = Attendance(**create_attendance.model_dump())
    session.add(db_attendance)
    session.commit()
    session.refresh(db_attendance)

    filtered_response = FilteredAttendanceResponse(
        attendance_id=db_attendance.attendance_id,
        attendance_date=db_attendance.attendance_date,
        attendance_time=db_attendance.attendance_time.attendance_time,
        attendance_class=db_attendance.attendance_class.class_name,
        attendance_teacher=db_attendance.attendance_teacher.teacher_name,
        attendance_student=db_attendance.attendance_student.student_name,
        attendance_std_fname=db_attendance.attendance_student.father_name,
        attendance_value=db_attendance.attendance_value.attendance_value,
    )

    return filtered_response

@mark_attendance_router.post("/add_bulk_attendance/", response_model=List[FilteredAttendanceResponse])
def add_bulk_attendance(
    
    bulk_attendance: BulkAttendanceCreate,
    session: Session = Depends(get_session)
):
    filtered_responses = []

    for attendance_data in bulk_attendance.attendances:
        db_attendance = Attendance(**attendance_data.model_dump())
        session.add(db_attendance)
        session.commit()
        session.refresh(db_attendance)

        filtered_response = FilteredAttendanceResponse(
            attendance_id=db_attendance.attendance_id,
            attendance_date=db_attendance.attendance_date,
            attendance_time=db_attendance.attendance_time.attendance_time,
            attendance_class=db_attendance.attendance_class.class_name,
            attendance_teacher=db_attendance.attendance_teacher.teacher_name,
            attendance_student=db_attendance.attendance_student.student_name,
            attendance_std_fname=db_attendance.attendance_student.father_name,
            attendance_value=db_attendance.attendance_value.attendance_value,
        )

        filtered_responses.append(filtered_response)

    return filtered_responses

@mark_attendance_router.delete("/delete_attendance/{attendance_id}", response_model=str)
def delete_attendance(attendance_id: int, session: Session = Depends(get_session)):
    attendance = session.get(Attendance, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    session.delete(attendance)
    session.commit()
    return f"Attendance record with ID {attendance_id} deleted successfully."

@mark_attendance_router.patch("/update_attendance/{attendance_id}", response_model=FilteredAttendanceResponse)
def update_attendance(
    
    attendance_id: int,
    attendance_update: AttendanceUpdate,
    session: Session = Depends(get_session)
):
    db_attendance = session.get(Attendance, attendance_id)
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    attendance_data = attendance_update.model_dump(exclude_unset=True)
    for key, value in attendance_data.items():
        setattr(db_attendance, key, value)

    session.add(db_attendance)
    session.commit()
    session.refresh(db_attendance)

    return FilteredAttendanceResponse(
        attendance_id=db_attendance.attendance_id,
        attendance_date=db_attendance.attendance_date,
        attendance_time=db_attendance.attendance_time.attendance_time,
        attendance_class=db_attendance.attendance_class.class_name,
        attendance_teacher=db_attendance.attendance_teacher.teacher_name,
        attendance_student=db_attendance.attendance_student.student_name,
        attendance_std_fname=db_attendance.attendance_student.father_name,
        attendance_value=db_attendance.attendance_value.attendance_value
    )

@mark_attendance_router.get("/filter_attendance_by_ids", response_model=List[FilteredAttendanceResponse])
def filter_attendance_by_ids(
    
    session: Session = Depends(get_session),
    attendance_date: Optional[str] = Query(None, description="Filter by Attendance date"),
    attendance_time_id: Optional[int] = Query(None, description="Filter by Attendance Time ID"),
    class_name_id: Optional[int] = Query(None, description="Filter by Class Name ID"),
    teacher_name_id: Optional[int] = Query(None, description="Filter by Teacher Name ID"),
    student_id: Optional[int] = Query(None, description="Filter by Student ID"),
    father_name: Optional[str] = Query(None, description="Filter by Father's Name"),
    attendance_value_id: Optional[int] = Query(None, description="Filter by Attendance Value ID"),
):
    query = session.query(Attendance)

    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)
    if attendance_time_id:
        query = query.filter(Attendance.attendance_time_id == attendance_time_id)
    if class_name_id:
        query = query.filter(Attendance.class_name_id == class_name_id)
    if teacher_name_id:
        query = query.filter(Attendance.teacher_name_id == teacher_name_id)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if father_name:
        query = query.join(Students).filter(Students.father_name == father_name)
    if attendance_value_id:
        query = query.filter(Attendance.attendance_value_id == attendance_value_id)

    filtered_attendance = query.all()

    if not filtered_attendance:
        raise HTTPException(status_code=404, detail="No attendance records found matching the criteria")

    filtered_responses = [
        FilteredAttendanceResponse(
            attendance_id=att.attendance_id,
            attendance_date=att.attendance_date,
            attendance_time=att.attendance_time.attendance_time,
            attendance_class=att.attendance_class.class_name,
            attendance_teacher=att.attendance_teacher.teacher_name,
            attendance_student=att.attendance_student.student_name,
            attendance_std_fname=att.attendance_student.father_name,
            attendance_value=att.attendance_value.attendance_value
        ) for att in filtered_attendance
    ]

    return filtered_responses

@mark_attendance_router.get("/filtered_attendance_by_name", response_model=List[FilteredAttendanceResponse])
def get_filtered_attendance(
    
    session: Session = Depends(get_session),
    class_name: Optional[str] = Query(None, description="Filter by Class name"),
    teacher_name: Optional[str] = Query(None, description="Filter by Teacher name"),
    student_name: Optional[str] = Query(None, description="Filter by Student name"),
    attendance_value: Optional[str] = Query(None, description="Filter by Attendance value"),
    attendance_date: Optional[str] = Query(None, description="Filter by Attendance date"),
    attendance_time: Optional[str] = Query(None, description="Filter by Attendance time"),
    attendance_id: Optional[int] = Query(None, description="Filter by Attendance ID"),
):
    query = session.exec(Attendance)

    if class_name:
        query = query.filter(Attendance.attendance_class.has(class_name=class_name))
    if teacher_name:
        query = query.filter(Attendance.attendance_teacher.has(teacher_name=teacher_name))
    if student_name:
        query = query.filter(Attendance.attendance_student.has(student_name=student_name))
    if attendance_value:
        query = query.filter(Attendance.attendance_value.has(attendance_value=attendance_value))
    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)
    if attendance_time:
        query = query.filter(Attendance.attendance_time.has(attendance_time=attendance_time))
    if attendance_id:
        query = query.filter(Attendance.attendance_id == attendance_id)

    filtered_attendance = query.all()

    filtered_responses = []
    for db_attendance in filtered_attendance:
        filtered_response = FilteredAttendanceResponse(
            attendance_id=db_attendance.attendance_id,
            attendance_date=db_attendance.attendance_date,
            attendance_time=db_attendance.attendance_time.attendance_time,
            attendance_class=db_attendance.attendance_class.class_name,
            attendance_teacher=db_attendance.attendance_teacher.teacher_name,
            attendance_student=db_attendance.attendance_student.student_name,
            attendance_std_fname=db_attendance.attendance_student.father_name,
            attendance_value=db_attendance.attendance_value.attendance_value
        )
        filtered_responses.append(filtered_response)

    if not filtered_responses:
        raise HTTPException(status_code=404, detail="No attendance records found matching the criteria")

    return filtered_responses
