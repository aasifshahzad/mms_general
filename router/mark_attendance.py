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
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from db import get_session
from schemas.attendance_model import (
    AttendanceCreate,
    BulkAttendanceCreate,
    FilteredAttendanceResponse,
)

mark_attendance_router = APIRouter(
    prefix="/mark_attendance",
    tags=["Mark Attendance"],
    responses={404: {"description": "Marking Attendance of Students"}})


@mark_attendance_router.get("/filtered_attendance", response_model=List[FilteredAttendanceResponse])
def get_filtered_attendance(session: Session = Depends(get_session)):
    # Select specific fields from each related model
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
        raise HTTPException(
            status_code=404, detail="No attendance records found")

    # Format the result as a list of dictionaries matching the response model
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


# @mark_attendance_router.post("/add_attendance/", response_model=FilteredAttendanceResponse)
# def add_attendance(create_attendance: AttendanceCreate, session: Session = Depends(get_session)):
#     # Create a new Attendance record using dictionary unpacking
#     db_attendance = Attendance(**create_attendance.model_dump())
#     session.add(db_attendance)
#     session.commit()
#     session.refresh(db_attendance)  # Refresh to get updated related fields

#     # Create a filtered response object with the required fields
#     filtered_response = FilteredAttendanceResponse(
#         attendance_id=db_attendance.attendance_id,
#         attendance_date=db_attendance.attendance_date,
#         attendance_time=db_attendance.attendance_time.attendance_time,
#         attendance_class=db_attendance.attendance_class.class_name,
#         attendance_teacher=db_attendance.attendance_teacher.teacher_name,
#         attendance_student=db_attendance.attendance_student.student_name,
#         attendance_std_fname=db_attendance.attendance_student.father_name,
#         attendance_value=db_attendance.attendance_value.attendance_value,
#     )

#     # Return the filtered response
#     return filtered_response

@mark_attendance_router.post("/add_attendance/", response_model=FilteredAttendanceResponse)
def add_attendance(create_attendance: AttendanceCreate, session: Session = Depends(get_session)):
    # First verify that the student exists
    student = session.get(Students, create_attendance.student_id)
    if not student:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {create_attendance.student_id} not found"
        )

    # Create attendance record only if student exists
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
    # List to store filtered responses
    filtered_responses = []

    # Loop through each attendance record
    for attendance_data in bulk_attendance.attendances:
        # Create a new Attendance record
        db_attendance = Attendance(**attendance_data.model_dump())

        # Add and commit each record
        session.add(db_attendance)
        session.commit()
        session.refresh(db_attendance)  # Refresh to get updated related fields

        # Create a filtered response for each attendance record
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

    # Return the list of filtered responses
    return filtered_responses

# @mark_attendance_router.patch("/update_attendance/{attendance_id}", response_model=FilteredAttendanceResponse)
# def update_attendance(attendance_id: int, update_data: AttendanceUpdate, session: Session = Depends(get_session)):
#     # Query to find the attendance record by ID
#     attendance = session.get(Attendance, attendance_id)
#     if not attendance:
#         # Raise an error if attendance record is not found
#         raise HTTPException(
#             status_code=404, detail="Attendance record not found")

@mark_attendance_router.delete("/delete_attendance/{attendance_id}", response_model=str)
def delete_attendance(attendance_id: int, session: Session = Depends(get_session)):
    # Query to find the attendance record by ID
    attendance = session.get(Attendance, attendance_id)
    if not attendance:
        # Raise an error if attendance record is not found
        raise HTTPException(
            status_code=404, detail="Attendance record not found")

    # Delete the record if found
    session.delete(attendance)
    session.commit()  # Commit to save changes
    return f"Attendance record with ID {attendance_id} deleted successfully."

@mark_attendance_router.patch("/update_attendance/{attendance_id}", response_model=FilteredAttendanceResponse)
def update_attendance(
    attendance_id: int,
    attendance_update: AttendanceUpdate,
    session: Session = Depends(get_session)
):
    # Get existing attendance record
    db_attendance = session.get(Attendance, attendance_id)
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    # Update the attendance record
    attendance_data = attendance_update.model_dump(exclude_unset=True)
    for key, value in attendance_data.items():
        setattr(db_attendance, key, value)

    session.add(db_attendance)
    session.commit()
    session.refresh(db_attendance)

    # Return the updated record in the expected format
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
