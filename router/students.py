from fastapi import APIRouter, Depends, HTTPException, Query
from router.class_names import read_classname
from schemas.class_names_model import ClassNames
from sqlmodel import Session, select
from typing import List, Optional
from typing import Annotated


from db import get_session
from schemas.students_model import Students, StudentsCreate, StudentsResponse, StudentsUpdate

students_router = APIRouter(
    prefix="/students",
    tags=["Students"],
    responses={404: {"description": "Not found"}}
)


@students_router.post("/add/", response_model=StudentsResponse)
def create_student(student: StudentsCreate, session: Annotated[Session, Depends(get_session)]):
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
def create_bulk_students(students: List[StudentsCreate], session: Annotated[Session, Depends(get_session)]):
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
def update_student(student_id: int, student: StudentsUpdate, session: Annotated[Session, Depends(get_session)]):
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
def delete_student(student_id: int, session: Annotated[Session, Depends(get_session)]):
    db_student = session.get(Students, student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    session.delete(db_student)
    session.commit()

    return {"message": "Student deleted successfully"}


@students_router.get("/all_students/", response_model=List[StudentsResponse])
def all_students(session: Annotated[Session, Depends(get_session)]):
    students = session.exec(select(Students)).all()
    return students


@students_router.get("/by_class_name/", response_model=List[StudentsResponse])
def get_students_by_class(class_name: str, session: Annotated[Session, Depends(get_session)]):
    query = select(Students).where(Students.class_name == class_name)
    students = session.exec(query).all()
    if not students:
        raise HTTPException(
            status_code=404, detail="No students found for the specified class")
    return students

@students_router.get("/by_class_id/", response_model=List[StudentsResponse])
def get_students_by_class(class_id: int, session: Annotated[Session, Depends(get_session)]):
    class_name = read_classname(class_id, session=session)
    if not class_name:
        raise HTTPException(status_code=404, detail="Class not found")
    query = select(Students).where(Students.class_name == class_name.class_name)
    students = session.exec(query).all()
    if not students:
        raise HTTPException(
            status_code=404, detail="No students found for the specified class")
    return students

@students_router.get("/by_gender", response_model=List[StudentsResponse])
def get_student_by_gender(gender: str, session: Annotated[Session, Depends(get_session)]):
    query = select(Students).where(Students.student_gender == gender)
    student = session.exec(query).all()
    if not student:
        raise HTTPException(
            status_code=404, detail="No Student found of this gender"
        )
    return student


@students_router.get("/by_city", response_model=List[StudentsResponse])
def get_student_by_gender(city: str, session: Annotated[Session, Depends(get_session)]):
    query = select(Students).where(Students.student_city == city)
    student = session.exec(query).all()
    if not student:
        raise HTTPException(
            status_code=404, detail="No Student found of this City"
        )
    return student


@students_router.get("/filter", response_model=List[StudentsResponse])
def filter_students(
    session: Annotated[Session, Depends(get_session)],
    class_name: Optional[str] = Query(
        None, description="Filter by class name"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    city: Optional[str] = Query(None, description="Filter by city"),

):
    query = select(Students)

    # Build the query dynamically based on the filters provided
    if class_name:
        query = query.where(Students.student_class_name == class_name)
    if gender:
        query = query.where(Students.student_gender == gender)
    if city:
        query = query.where(Students.student_city == city)

    # Execute the query
    students = session.exec(query).all()
    if not students:
        raise HTTPException(
            status_code=404, detail="No students found matching the criteria")

    return students
