from asyncio.log import logger
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session

from schemas.teacher_names_model import TeacherNames, TeacherNamesCreate, TeacherNamesResponse
from user.user_crud import check_admin, check_authenticated_user
from user.user_models import User

teachernames_router = APIRouter(
    prefix="/teacher_name",
    tags=["Teacher Name"],
    responses={404: {"Description": "Not found"}}
)


@teachernames_router.get("/", response_model=dict)
async def root():
    return {"message": "MMS-General service is running", "status": "Teacher Name Router Page running :-)"}


@teachernames_router.post("/add_teacher_name/", response_model=TeacherNamesResponse)
def create_teachernames( user: Annotated[User, Depends(check_admin)],teachernames: TeacherNamesCreate, session: Session = Depends(get_session),):
    db_teachernames = TeacherNames(**teachernames.model_dump())
    session.add(db_teachernames)

    try:
        session.commit()
        session.refresh(db_teachernames)
    except Exception as e:
        session.rollback()
        # Log any other unexpected errors
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail="Teacher name must be unique."
        )

    return db_teachernames

# # Returns all placed teacher names


@teachernames_router.get("/teacher-names-all/", response_model=List[TeacherNamesResponse])
def read_teachernames(current_user: Annotated[User, Depends(check_authenticated_user)],session: Session = Depends(get_session)):
    teachernames = session.exec(select(TeacherNames)).all()
    return teachernames

# # Returns teacher name of any specific teacher-name-id


@teachernames_router.get("/{teacher_name_id}", response_model=TeacherNamesResponse)
def read_teachernames(current_user: Annotated[User, Depends(check_authenticated_user)],teacher_name_id: int, session: Session = Depends(get_session)):
    teachernames = session.get(TeacherNames, teacher_name_id)
    if not teachernames:
        raise HTTPException(
            status_code=404, detail="Teacher name not found")
    return teachernames


@teachernames_router.delete("/del/{teacher_name}", response_model=dict)
def delete_teachernames(user: Annotated[User, Depends(check_admin)],teacher_name: str, session: Session = Depends(get_session)):
    teachernames = session.exec(select(TeacherNames).where(
        TeacherNames.teacher_name == teacher_name)).first()
    print(teachernames)
    if not teachernames:
        raise HTTPException(
            status_code=404, detail="Teacher Name not found")
    session.delete(teachernames)
    session.commit()
    return {"message": "Teacher Name deleted successfully"}
