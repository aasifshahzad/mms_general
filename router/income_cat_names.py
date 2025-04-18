from asyncio.log import logger
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session

from schemas.income_cat_names_model import IncomeCatNames, IncomeCatNamesCreate, IncomeCatNamesResponse
from user.user_crud import check_admin, check_authenticated_user
from user.user_models import User

income_cat_names_router = APIRouter(
    prefix="/income_cat_names",
    tags=["Income Category Names"],
    responses={404: {"Description": "Not found"}}
)


@income_cat_names_router.get("/", response_model=dict)
async def root():
    return {"message": "MMS-General service is running", "status": "Income Category Names Router Page running :-)"}


@income_cat_names_router.post("/add_income_cat_name/", response_model=IncomeCatNamesResponse)
def create_income_cat_name( user: Annotated[User, Depends(check_admin)], income_cat_name: IncomeCatNamesCreate, session: Session = Depends(get_session),):
    db_income_cat_name = IncomeCatNames(**income_cat_name.model_dump())
    session.add(db_income_cat_name)

    try:
        session.commit()
        session.refresh(db_income_cat_name)
    except Exception as e:
        session.rollback()
        # Log any other unexpected errors
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail="Income category name must be unique."
        )

    return db_income_cat_name




@income_cat_names_router.get("/income-cat-names-all/", response_model=List[IncomeCatNamesResponse])
def read_income_cat_names(current_user: Annotated[User, Depends(check_authenticated_user)], session: Session = Depends(get_session)):
    income_cat_names = session.exec(select(IncomeCatNames)).all()
    return income_cat_names




@income_cat_names_router.get("/{income_cat_id}", response_model=IncomeCatNamesResponse)
def read_income_cat_name(current_user: Annotated[User, Depends(check_authenticated_user)], income_cat_id: int, session: Session = Depends(get_session)):
    income_cat_name = session.get(IncomeCatNames, income_cat_id)
    if not income_cat_name:
        raise HTTPException(
            status_code=404, detail="Income category name not found")
    return income_cat_name


@income_cat_names_router.delete("/del/{income_cat_id}", response_model=dict)
def delete_income_cat_name(user: Annotated[User, Depends(check_admin)], income_cat_id: int, session: Session = Depends(get_session)):
    income_cat_name = session.get(IncomeCatNames, income_cat_id)
    if not income_cat_name:
        raise HTTPException(
            status_code=404, detail="Income category name not found")
    session.delete(income_cat_name)
    session.commit()
    return {"message": "Income Category Name deleted successfully"}
