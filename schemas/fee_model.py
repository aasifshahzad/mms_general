from datetime import datetime
from sqlmodel import Relationship, SQLModel, Field
from typing import List, Optional, TYPE_CHECKING

# if TYPE_CHECKING:
#     from .students_model import Students
#     from .class_names_model import ClassNames

class FeeBase(SQLModel):
    fee_id: int = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now, nullable=False)

class Fee(FeeBase, table=True):
    student_id: int = Field(foreign_key="students.student_id", nullable=False)
    class_id: int = Field(foreign_key="classnames.class_name_id", nullable=False)
    fee_amount: float = Field(nullable=False)
    fee_month: int = Field(nullable=False)
    fee_year: int = Field(nullable=False)
    fee_paid: bool = Field(nullable=False)

    # Relationships back to Student and ClassNames
    students: Optional["Students"] = Relationship(back_populates="fees")
    class_names: Optional["ClassNames"] = Relationship(back_populates="fees")
    

class FeeCreate(SQLModel):
    student_id: int
    class_id: int
    fee_amount: float
    fee_month: int
    fee_year: int
    fee_paid: bool

class FeeResponse(FeeBase, SQLModel):
    student_name: Optional[str] = None
    father_name: Optional[str] = None
    class_name: Optional[str] = None
    fee_amount: float
    fee_month: int
    fee_year: int
    fee_paid: bool

class FeeUpdateRequest(FeeBase, SQLModel):
    fee_amount: Optional[float] = None
    fee_month: Optional[int] = None
    fee_year: Optional[int] = None
    fee_paid: Optional[bool] = None


