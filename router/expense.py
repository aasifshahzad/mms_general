from typing import List, Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException

from sqlmodel import Session, select

from db import get_session
from schemas.expense_model import Expense, ExpenseCreate, ExpenseResponse, ExpenseUpdate
from schemas.expense_cat_names_model import ExpenseCatNames  # Import ExpenseCatNames
from user.user_crud import check_admin, check_authenticated_user
from user.user_models import User, UserRole

expense_router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"],
    responses={404: {"Description": "Not found"}}
)

@expense_router.get("/", response_model=dict)
async def root():
    return {"message": "MMS-General service is running", "status": "Expense Router Page running :-)"}

@expense_router.post("/add_expense/", response_model=ExpenseResponse)
def create_expense(
     user: Annotated[User, Depends(check_admin)],session: Session = Depends(get_session), expense: ExpenseCreate = None
):
    # Ensure created_at is set to the current datetime if not provided
    if not expense.created_at:
        expense.created_at = datetime.utcnow()

    # Validate category_id
    category = session.get(ExpenseCatNames, expense.category_id)
    if not category:
        raise HTTPException(
            status_code=400, detail=f"Invalid category_id: {expense.category_id}"
        )
        

    # Remove id from the expense dictionary to avoid conflicts
    expense_data = expense.dict(exclude={"id"})
    db_expense = Expense(**expense_data)
    session.add(db_expense)

    try:
        session.commit()
        session.refresh(db_expense)
    except Exception as e:
        session.rollback()
        # Log the exact exception for debugging
        raise HTTPException(
            status_code=500, detail=f"Error creating expense: {str(e)}"
        )

    # Return the response with the category name as a string
    return ExpenseResponse(
        id=db_expense.id,
        created_at=db_expense.created_at,
        recipt_number=db_expense.recipt_number,
        date=db_expense.date,
        category=category.expense_cat_name,  # Use category name directly in the response
        to_whom=db_expense.to_whom,
        description=db_expense.description,
        amount=db_expense.amount,
    )

@expense_router.get("/expenses-all/", response_model=List[ExpenseResponse])
def read_expenses(user: Annotated[User, Depends(check_admin)], session: Session = Depends(get_session)):
    expenses = session.exec(select(Expense)).all()
    # Map category to its string representation
    return [
        ExpenseResponse(
            id=expense.id,
            created_at=expense.created_at,
            recipt_number=expense.recipt_number,
            date=expense.date,
            category=expense.category.expense_cat_name if expense.category else None,
            to_whom=expense.to_whom,
            description=expense.description,
            amount=expense.amount,
        )
        for expense in expenses
    ]

@expense_router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(user: Annotated[User, Depends(check_admin)],expense_id: int, session: Session = Depends(get_session)):
    expense = session.get(Expense, expense_id)
    if not expense:
        raise HTTPException(
            status_code=404, detail="Expense not found")
    # Map category to its string representation
    return ExpenseResponse(
        id=expense.id,
        created_at=expense.created_at,
        recipt_number=expense.recipt_number,
        date=expense.date,
        category=expense.category.expense_cat_name if expense.category else None,
        to_whom=expense.to_whom,
        description=expense.description,
        amount=expense.amount,
    )

@expense_router.put("/update/{expense_id}", response_model=ExpenseResponse)
def update_expense(user: Annotated[User, Depends(check_admin)],
    expense_id: int, expense_update: ExpenseUpdate, session: Session = Depends(get_session)):
    db_expense = session.get(Expense, expense_id)
    if not db_expense:
        raise HTTPException(
            status_code=404, detail="Expense not found")

    for key, value in expense_update.dict(exclude_unset=True).items():
        setattr(db_expense, key, value)

    try:
        session.commit()
        session.refresh(db_expense)
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail="Error updating expense."
        )

    # Map category to its string representation
    return ExpenseResponse(
        id=db_expense.id,
        created_at=db_expense.created_at,
        recipt_number=db_expense.recipt_number,
        date=db_expense.date,
        category=db_expense.category.expense_cat_name if db_expense.category else None,
        to_whom=db_expense.to_whom,
        description=db_expense.description,
        amount=db_expense.amount,
    )

@expense_router.delete("/del/{expense_id}", response_model=dict)
def delete_expense(user: Annotated[User, Depends(check_admin)],expense_id: int, session: Session = Depends(get_session)):
    expense = session.get(Expense, expense_id)
    if not expense:
        raise HTTPException(
            status_code=404, detail="Expense not found")
    session.delete(expense)
    session.commit()
    return {"message": "Expense deleted successfully"}

@expense_router.get("/filter-by-category/{category_id}", response_model=List[ExpenseResponse])
def filter_expenses_by_category(user: Annotated[User, Depends(check_admin)], category_id: int, session: Session = Depends(get_session)):
    expenses = session.exec(select(Expense).where(Expense.category_id == category_id)).all()
    if not expenses:
        raise HTTPException(
            status_code=404, detail="No expenses found for the given category")
    # Map category to its string representation
    return [
        ExpenseResponse(
            id=expense.id,
            created_at=expense.created_at,
            recipt_number=expense.recipt_number,
            date=expense.date,
            category=expense.category.expense_cat_name if expense.category else None,
            to_whom=expense.to_whom,
            description=expense.description,
            amount=expense.amount,
        )
        for expense in expenses
    ]
