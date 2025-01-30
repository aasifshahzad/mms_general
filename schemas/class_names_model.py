from datetime import datetime
from sqlmodel import Relationship, SQLModel, Field
from typing import List, Optional
from datetime import datetime



# ****************************************************************************************
# Class Names


class ClassNamesBase(SQLModel):
    class_name_id: int = Field(primary_key=True)
    created_at: datetime = Field(default=datetime.now(), nullable=False)


class ClassNames(ClassNamesBase, table=True):
    class_name: str = Field(index=True, unique=True)

    # Relationship back to Attendance
    attendances: list["Attendance"] = Relationship(
        back_populates="attendance_class")


class ClassNamesCreate(SQLModel):
    class_name_id: int = Field(primary_key=True)
    created_at: datetime = Field(default=datetime.now(), nullable=False)
    class_name: str = Field(index=True, unique=True)


class ClassNamesResponse(ClassNamesBase, SQLModel):
    class_name: str
