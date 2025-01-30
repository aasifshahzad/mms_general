from datetime import datetime
from sqlmodel import Relationship, SQLModel, Field, Column
from sqlalchemy import String, Integer, DateTime
from typing import List, Optional, TYPE_CHECKING


from schemas.attendance_time_model import AttendanceTime
from schemas.class_names_model import ClassNames
from schemas.teacher_names_model import TeacherNames
from schemas.students_model import Students
from schemas.attendance_value_model import AttendanceValue

# Attendance--------------------------------------------------------------------------------------------------
# Mark Student's Attendance


class AttendanceBase(SQLModel):
    attendance_id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default=datetime.now(), nullable=False)
    updated_at: datetime = Field(default=datetime.now(), nullable=False)


class Attendance(AttendanceBase, table=True):
    attendance_date: datetime

    attendance_time_id: Optional[int] = Field(
        foreign_key="attendancetime.attendance_time_id")
    class_name_id: Optional[int] = Field(
        foreign_key="classnames.class_name_id")
    teacher_name_id: Optional[int] = Field(
        foreign_key="teachernames.teacher_name_id")
    student_id: Optional[int] = Field(foreign_key="students.student_id")
    attendance_value_id: Optional[int] = Field(
        foreign_key="attendancevalue.attendance_value_id")

    # Relationships
    attendance_time: Optional[AttendanceTime] = Relationship(
        back_populates="attendances")
    attendance_class: Optional[ClassNames] = Relationship(
        back_populates="attendances")
    attendance_teacher: Optional[TeacherNames] = Relationship(
        back_populates="attendances")
    attendance_student: Optional[Students] = Relationship(
        back_populates="attendances")
    attendance_value: Optional[AttendanceValue] = Relationship(
        back_populates="attendances")


class AttendanceCreate(SQLModel):
    attendance_date: datetime
    attendance_time_id: int
    class_name_id: int
    teacher_name_id: int
    student_id: int
    attendance_value_id: int


class FilteredAttendanceResponse(SQLModel):
    attendance_id: int
    attendance_date: datetime
    attendance_time: str
    attendance_class: str
    attendance_teacher: str
    attendance_student: str
    attendance_std_fname: str
    attendance_value: str


class BulkAttendanceCreate(SQLModel):
    attendances: List[AttendanceCreate]
