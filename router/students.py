from fastapi import APIRouter, Depends, HTTPException, Query
from router.class_names import read_classname
from schemas.class_names_model import ClassNames
from sqlmodel import Session, select
from typing import List, Optional
from typing import Annotated
from user.user_models import User, UserRole
from user.user_crud import get_current_user

from db import get_session
from schemas.students_model import Students, StudentsCreate, StudentsResponse, StudentsUpdate
from user.user_crud import check_admin
from user.user_models import User

students_router = APIRouter(
    prefix="/students",
    tags=["Students"],
    responses={404: {"description": "Not found"}}
)


@students_router.post("/add/", response_model=StudentsResponse)
def create_student(user: Annotated[User, Depends(check_admin)],student: StudentsCreate, session: Annotated[Session, Depends(get_session)]):
    db_student = Students(**student.model_dump())
    session.add(db_student)

    try:
        session.commit()
        session.refresh(db_student)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return db_student


@students_router.post("/add_bulk/", response_model=List[StudentsResponse])
def create_bulk_students(user: Annotated[User, Depends(check_admin)],students: List[StudentsCreate], session: Annotated[Session, Depends(get_session)]):
    db_students = [Students(**student.model_dump()) for student in students]
    session.add_all(db_students)

    try:
        session.commit()
        for student in db_students:
            session.refresh(student)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return db_students


@students_router.patch("/{student_id}", response_model=StudentsResponse)
def update_student(user: Annotated[User, Depends(check_admin)],student_id: int, student: StudentsUpdate, session: Annotated[Session, Depends(get_session)]):
    db_student = session.exec(select(Students).where(
        Students.student_id == student_id)).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_dict_data = student.model_dump(exclude_unset=True)
    for key, value in student_dict_data.items():
        setattr(db_student, key, value)

    session.add(db_student)
    session.commit()
    session.refresh(db_student)

    return db_student


@students_router.delete("/{student_id}", response_model=dict)
def delete_student(user: Annotated[User, Depends(check_admin)],student_id: int, session: Annotated[Session, Depends(get_session)]):
    db_student = session.get(Students, student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    session.delete(db_student)
    session.commit()

    return {"message": "Student deleted successfully"}


@students_router.get("/all_students/", response_model=List[StudentsResponse])
def all_students(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=403,
            detail="Only teachers and administrators can view student records"
        )
    students = session.exec(select(Students)).all()
    return students


@students_router.get("/by_class_name/", response_model=List[StudentsResponse])
def get_students_by_class(
    current_user: Annotated[User, Depends(get_current_user)],
    class_name: str, 
    session: Annotated[Session, Depends(get_session)]
):
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=403,
            detail="Only teachers and administrators can view student records"
        )
    query = select(Students).where(Students.class_name == class_name)
    students = session.exec(query).all()
    if not students:
        raise HTTPException(
            status_code=404, 
            detail="No students found for the specified class"
        )
    return students


@students_router.get("/by_class_id/", response_model=List[StudentsResponse])
def get_students_by_class_id(
    current_user: Annotated[User, Depends(get_current_user)],
    class_id: int, 
    session: Annotated[Session, Depends(get_session)]
):
    try:
        # Check user authorization
        if current_user.role == UserRole.USER:
            raise HTTPException(
                status_code=403,
                detail="Only teachers and administrators can view student records"
            )
        
        # Validate class_id
        if class_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid class ID"
            )
        
        # Get class name from class_id using class_name_id from ClassNames model
        class_name_obj = session.exec(
            select(ClassNames).where(ClassNames.class_name_id == class_id)
        ).first()
        
        if not class_name_obj:
            raise HTTPException(
                status_code=404, 
                detail=f"Class with ID {class_id} not found"
            )
        
        # Query students by class name
        students = session.exec(
            select(Students).where(Students.class_name == class_name_obj.class_name)
        ).all()
        
        if not students:
            raise HTTPException(
                status_code=404, 
                detail=f"No students found for class {class_name_obj.class_name}"
            )
            
        return students
        
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving students: {str(e)}"
        )


@students_router.get("/by_gender", response_model=List[StudentsResponse])
def get_student_by_gender(
    current_user: Annotated[User, Depends(get_current_user)],
    gender: str, 
    session: Annotated[Session, Depends(get_session)]
):
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=403,
            detail="Only teachers and administrators can view student records"
        )
    query = select(Students).where(Students.student_gender == gender)
    student = session.exec(query).all()
    if not student:
        raise HTTPException(
            status_code=404, 
            detail="No Student found of this gender"
        )
    return student


@students_router.get("/by_city", response_model=List[StudentsResponse])
def get_student_by_city(
    current_user: Annotated[User, Depends(get_current_user)],
    city: str, 
    session: Annotated[Session, Depends(get_session)]
):
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=403,
            detail="Only teachers and administrators can view student records"
        )
    query = select(Students).where(Students.student_city == city)
    student = session.exec(query).all()
    if not student:
        raise HTTPException(
            status_code=404, 
            detail="No Student found of this City"
        )
    return student


@students_router.get("/filter", response_model=List[StudentsResponse])
def filter_students(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    class_name: Optional[str] = Query(None, description="Filter by class name"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    city: Optional[str] = Query(None, description="Filter by city"),
):
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=403,
            detail="Only teachers and administrators can view student records"
        )
    query = select(Students)

    if class_name:
        query = query.where(Students.class_name == class_name)
    if gender:
        query = query.where(Students.student_gender == gender)
    if city:
        query = query.where(Students.student_city == city)

    students = session.exec(query).all()
    if not students:
        raise HTTPException(
            status_code=404, 
            detail="No students found matching the criteria"
        )
    return students


async def get_student_by_id(db: Session, student_id: int) -> Students | None:
    """Get a student by their ID."""
    return db.exec(select(Students).where(Students.student_id == student_id)).first()
