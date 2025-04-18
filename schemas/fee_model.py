from datetime import datetime
from sqlmodel import  Relationship, SQLModel, Field
from typing import List, Optional
import enum

# if TYPE_CHECKING:
#     from .students_model import Students
#     from .class_names_model import ClassNames

class FeeStatus(str, enum.Enum):
    PAID = "Paid"
    UNPAID = "Unpaid"

class FeeBase(SQLModel):
    fee_id: int = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now, nullable=False)

class Fee(FeeBase, table=True):
    student_id: int = Field(foreign_key="students.student_id", nullable=False)
    class_id: int = Field(foreign_key="classnames.class_name_id", nullable=False)
    fee_amount: float = Field(nullable=False)
    fee_month: str = Field(nullable=False)
    fee_year: str = Field(nullable=False)
    fee_status: FeeStatus = Field(nullable=False, default=FeeStatus.UNPAID)

    # Relationships back to Student and ClassNames
    students: Optional["Students"] = Relationship(back_populates="fees") # type: ignore
    class_names: Optional["ClassNames"] = Relationship(back_populates="fees") # type: ignore
    

class FeeCreate(SQLModel):
    student_id: int
    class_id: int
    fee_amount: float
    fee_month: str
    fee_year: int
    # fee_status: FeeStatus = FeeStatus.UNPAID

class FeeResponse(FeeBase, SQLModel):
    student_name: Optional[str] = None
    father_name: Optional[str] = None
    class_name: Optional[str] = None
    fee_amount: float
    fee_month: str
    fee_year: int 
    fee_status: FeeStatus

class FeeUpdateRequest(FeeBase, SQLModel):
    fee_amount: Optional[float] = None
    fee_month: Optional[int] = None
    fee_year: Optional[int] = None
    fee_status: Optional[FeeStatus] = None

class FeeFilter(SQLModel):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    fee_month: Optional[str] = None
    fee_year: Optional[int] = None
    fee_status: Optional[FeeStatus] = None

class FeeDelete(SQLModel):
    fee_id: int
    message: str = "Fee deleted successfully"

