from datetime import datetime
from sqlmodel import Relationship, SQLModel, Field
from typing import List, Optional, TYPE_CHECKING
# from schemas.attendance_model import Attendance
# from schemas.fee_model import Fee

# ****************************************************************************************
# Class Names

class ClassNamesBase(SQLModel):
    class_name_id: int = Field(primary_key=True)
    created_at: datetime = Field(default=datetime.now(), nullable=False)


class ClassNames(ClassNamesBase, table=True):
    class_name: str = Field(index=True, unique=True)

    # Relationship back to Attendance
    attendances: List["Attendance"] = Relationship(back_populates="attendance_class")
    fees: List["Fee"] = Relationship(back_populates="class_names")


class ClassNamesCreate(SQLModel):
    class_name_id: int = Field(primary_key=True)
    created_at: datetime = Field(default=datetime.now(), nullable=False)
    class_name: str = Field(index=True, unique=True)


class ClassNamesResponse(ClassNamesBase, SQLModel):
    class_name: str
