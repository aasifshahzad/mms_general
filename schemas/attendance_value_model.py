from datetime import datetime
from sqlmodel import Relationship, SQLModel, Field, Column
from sqlalchemy import String, Integer, DateTime
from typing import List, Optional

from datetime import datetime
# from schemas.attendance_model import Attendance

# Attendance Value


class AttendanceValueBase(SQLModel):
    attendance_value_id: int = Field(primary_key=True)
    created_at: datetime = Field(default=datetime.now(), nullable=False)


class AttendanceValue(AttendanceValueBase, table=True):
    attendance_value: str = Field(index=True, unique=True)

    # Relationship back to Attendance
    attendances: list["Attendance"] = Relationship(
        back_populates="attendance_value")


class AttendanceValueCreate(SQLModel):
    attendance_value_id: int = Field(primary_key=True)
    created_at: datetime = Field(default=datetime.now(), nullable=False)
    attendance_value: str = Field(index=True, unique=True)


class AttendanceValueResponse (AttendanceValueBase, SQLModel):
    attendance_value: str


class AttendanceValueDelete(SQLModel):
    attendance_value_id: int
    message: str = "Attendance value deleted successfully"
