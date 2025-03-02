from asyncio.log import logger
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from schemas.class_names_model import ClassNames, ClassNamesCreate, ClassNamesResponse
from user.user_crud import check_admin
from user.user_models import User

classnames_router = APIRouter(
    prefix="/class_name",
    tags=["Class Name"],
    responses={404: {"Description": "Not found"}}
)


@classnames_router.get("/", response_model=dict)
async def root():
    return {"message": "MMS-General service is running", "status": "Class Name Router Page running :-)"}


@classnames_router.post("/add_class_name/", response_model=ClassNamesResponse)
def create_classnames(user: Annotated[User, Depends(check_admin)],classnames: ClassNamesCreate, session: Session = Depends(get_session)):
    db_classnames = ClassNames(**classnames.model_dump())
    session.add(db_classnames)

    try:
        session.commit()
        session.refresh(db_classnames)
    except Exception as e:
        session.rollback()
        # Log any other unexpected errors
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail="Class name must be unique."
        )

    return db_classnames

# # Returns all placed class names


@classnames_router.get("/class-names-all/", response_model=List[ClassNamesResponse])
def read_classnames(session: Session = Depends(get_session)):
    classnames = session.exec(select(ClassNames)).all()
    return classnames

# # Returns class name of any specific class-name-id


@classnames_router.get("/{class_name_id}", response_model=ClassNamesResponse)
def read_classname(class_name_id: int, session: Session = Depends(get_session)):
    classnames = session.get(ClassNames, class_name_id)
    if not classnames:
        raise HTTPException(
            status_code=404, detail="Class name not found")
    return classnames


@classnames_router.delete("/del/{class_name}", response_model=dict)
def delete_classnames(user: Annotated[User, Depends(check_admin)],class_name: str, session: Session = Depends(get_session)):
    classnames = session.exec(select(ClassNames).where(
        ClassNames.class_name == class_name)).first()
    print(classnames)
    if not classnames:
        raise HTTPException(
            status_code=404, detail="Class Name not found")
    session.delete(classnames)
    session.commit()
    return {"message": "Class Name deleted successfully"}
