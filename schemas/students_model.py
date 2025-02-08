from datetime import datetime
from sqlmodel import Relationship, SQLModel, Field, Column
from sqlalchemy import String, Integer, DateTime
from typing import List, Optional

from sqlmodel import Field, SQLModel
from datetime import datetime

# ****************************************************************************************
# Students


class StudentsBase(SQLModel):
    student_id: Optional[int] = Field(default=None, primary_key=True)


class Students(StudentsBase, table=True):
    student_name: str
    student_date_of_birth: datetime = Field(sa_column=Column(DateTime))
    student_gender: str
    student_age: str
    student_education: str
    class_name: str
    student_city: str
    student_address: str

    father_name: str
    father_occupation: str
    father_cnic: str
    father_cast_name: str
    father_contact: str

    # Relationship to Attendance
    attendances: list["Attendance"] = Relationship(
        back_populates="attendance_student")
    admissions: list["Admission"] = Relationship(back_populates="student")


class StudentsCreate(SQLModel):
    student_name: str
    student_date_of_birth: datetime = Field(sa_column=Column(DateTime))
    student_gender: str
    student_age: str
    student_education: str
    class_name: str
    student_city: str
    student_address: str
    father_name: str
    father_occupation: str
    father_cnic: str
    father_cast_name: str
    father_contact: str


class StudentsResponse(StudentsBase):
    student_id: int  # Include the ID in the response model
    student_name: str
    student_date_of_birth: datetime = Field(sa_column=Column(DateTime))
    student_gender: str
    student_age: str
    student_education: str
    class_name: str
    student_city: str
    student_address: str

    father_name: str
    father_occupation: str
    father_cnic: str
    father_cast_name: str
    father_contact: str


class StudentsUpdate(SQLModel):
    student_name: Optional[str] = None
    student_date_of_birth: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime))
    student_gender: Optional[str] = None
    student_age: Optional[str] = None
    student_education: Optional[str] = None
    class_name: Optional[str] = None
    student_city: Optional[str] = None
    student_address: Optional[str] = None

    father_name: Optional[str] = None
    father_occupation: Optional[str] = None
    father_cnic: Optional[str] = None
    father_cast_name: Optional[str] = None
    father_contact: Optional[str] = None
