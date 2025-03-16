from typing import Optional
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel import Session, select
from schemas.students_model import Students
from schemas.class_names_model import ClassNames
from router.students import get_student_by_id  # Add this import at the top
from sqlalchemy import func

from db import get_session
from schemas.fee_model import Fee, FeeCreate, FeeResponse, FeeUpdateRequest
from user.user_crud import check_admin, check_authenticated_user
from user.user_models import User

fee_router = APIRouter(
    prefix="/fee",
    tags=["Student Fee"],
    responses={404: {"Description": "Not found"}}
)

@fee_router.get("/", response_model=dict)
async def root():
    return {"message": "Fee Router Page running :-)"}


@fee_router.post("/add_fee", response_model=FeeResponse, status_code=status.HTTP_201_CREATED)
async def create_fee(
    fee_data: FeeCreate,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_admin)]
):
    """Create a new student fee record (Admin only)."""
    try:
        # Validate student exists
        student = db.exec(select(Students).where(Students.student_id == fee_data.student_id)).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID {fee_data.student_id} not found"
            )

        # Validate class exists
        class_name = db.exec(select(ClassNames).where(ClassNames.class_name_id == fee_data.class_id)).first()
        if not class_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Class with ID {fee_data.class_id} not found"
            )

        new_fee = Fee(**fee_data.model_dump())
        db.add(new_fee)
        db.commit()
        db.refresh(new_fee)

        # Create response with student and class details
        response = FeeResponse(
            fee_id=new_fee.fee_id,
            created_at=new_fee.created_at,
            student_name=student.student_name,
            father_name=student.father_name,
            class_name=class_name.class_name,
            fee_amount=new_fee.fee_amount,
            fee_month=new_fee.fee_month,
            fee_year=new_fee.fee_year,
            fee_paid=new_fee.fee_paid
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating fee record: {str(e)}"
        )

@fee_router.get("/all", response_model=List[FeeResponse])
async def get_all_fees(
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_authenticated_user)]
):
    """Retrieve all student fee records (Authenticated users)."""
    fees = db.exec(select(Fee)).all()
    
    # Create response list with student and class details
    response_list = []
    for fee in fees:
        # Get student details
        student = await get_student_by_id(db, fee.student_id)
        
        # Get class details
        class_name = db.exec(
            select(ClassNames)
            .where(ClassNames.class_name_id == fee.class_id)
        ).first()
        
        response = FeeResponse(
            fee_id=fee.fee_id,
            created_at=fee.created_at,
            student_name=student.student_name if student else None,
            father_name=student.father_name if student else None,
            class_name=class_name.class_name if class_name else None,
            fee_amount=fee.fee_amount,
            fee_month=fee.fee_month,
            fee_year=fee.fee_year,
            fee_paid=fee.fee_paid
        )
        response_list.append(response)
    
    return response_list

@fee_router.get("/{fee_id}", response_model=FeeResponse)
async def get_fee(
    fee_id: int,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_authenticated_user)]
):
    """Retrieve a student fee record by ID (Authenticated users)."""
    # Get fee record with joined data
    fee = db.exec(
        select(Fee)
        .where(Fee.fee_id == fee_id)
    ).first()
    
    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee record with ID {fee_id} not found"
        )
    
    # Get student details
    student = await get_student_by_id(db, fee.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated student with ID {fee.student_id} not found"
        )
    
    # Get class details
    class_name = db.exec(
        select(ClassNames)
        .where(ClassNames.class_name_id == fee.class_id)
    ).first()
    
    # Construct response in the required format
    response = FeeResponse(
        fee_id=fee.fee_id,
        created_at=fee.created_at,
        student_name=student.student_name,
        father_name=student.father_name,
        class_name=class_name.class_name,
        fee_amount=fee.fee_amount,
        fee_month=fee.fee_month,
        fee_year=fee.fee_year,
        fee_paid=fee.fee_paid
    )
    
    return response


@fee_router.get("/", response_model=List[FeeResponse])
async def list_fees(
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_authenticated_user)]
):
    """List all student fee records (Authenticated users)."""
    fees = db.exec(select(Fee)).all()
    return fees



@fee_router.put("/{fee_id}", response_model=FeeResponse)
async def update_fee(
    fee_id: int,
    *,
    db: Annotated[Session, Depends(get_session)],
    fee_amount: Optional[float] = Body(None),
    fee_month: Optional[int] = Body(None),
    fee_year: Optional[int] = Body(None),
    fee_paid: Optional[bool] = Body(None),
    current_user: Annotated[User, Depends(check_admin)]
):
    """Update specific fields of a student fee record by ID (Admin only)."""
    # Get existing fee record with relationships
    fee = db.exec(select(Fee).where(Fee.fee_id == fee_id)).first()
    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee record with ID {fee_id} not found"
        )
    
    # Update only provided fields
    if fee_amount is not None:
        fee.fee_amount = fee_amount
    if fee_month is not None:
        fee.fee_month = fee_month
    if fee_year is not None:
        fee.fee_year = fee_year
    if fee_paid is not None:
        fee.fee_paid = fee_paid
    
    try:
        db.commit()
        db.refresh(fee)

        # Get student and class details for response
        student = await get_student_by_id(db, fee.student_id)
        class_name = db.exec(
            select(ClassNames)
            .where(ClassNames.class_name_id == fee.class_id)
        ).first()

        # Return complete response with all details
        response = FeeResponse(
            fee_id=fee.fee_id,
            created_at=fee.created_at,
            student_name=student.student_name if student else None,
            father_name=student.father_name if student else None,
            class_name=class_name.class_name if class_name else None,
            fee_amount=fee.fee_amount,
            fee_month=fee.fee_month,
            fee_year=fee.fee_year,
            fee_paid=fee.fee_paid
        )
        
        return response
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating fee record: {str(e)}"
        )

@fee_router.delete("/{fee_id}", response_model=dict)
async def delete_fee(
    fee_id: int,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_admin)]
):
    """Delete a student fee record by ID (Admin only)."""
    # Get fee record
    fee = db.exec(select(Fee).where(Fee.fee_id == fee_id)).first()
    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee record with ID {fee_id} not found"
        )

    try:
        db.delete(fee)
        db.commit()
        return {"message": f"Fee record with ID {fee_id} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting fee record: {str(e)}"
        )

# Add these new endpoints after your existing endpoints

@fee_router.get("/status/{paid}", response_model=List[FeeResponse])
async def get_fees_by_payment_status(
    paid: bool,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_authenticated_user)]
):
    """Retrieve all fees by payment status (paid/unpaid)."""
    fees = db.exec(select(Fee).where(Fee.fee_paid == paid)).all()
    
    # Create response list with student and class details
    response_list = []
    for fee in fees:
        student = await get_student_by_id(db, fee.student_id)
        class_name = db.exec(
            select(ClassNames)
            .where(ClassNames.class_name_id == fee.class_id)
        ).first()
        
        response = FeeResponse(
            fee_id=fee.fee_id,
            created_at=fee.created_at,
            student_name=student.student_name if student else None,
            father_name=student.father_name if student else None,
            class_name=class_name.class_name if class_name else None,
            fee_amount=fee.fee_amount,
            fee_month=fee.fee_month,
            fee_year=fee.fee_year,
            fee_paid=fee.fee_paid
        )
        response_list.append(response)
    
    return response_list

@fee_router.get("/student/{student_id}/fees", response_model=List[FeeResponse])
async def get_student_fees(
    current_user: Annotated[User, Depends(check_authenticated_user)],
    db: Annotated[Session, Depends(get_session)],
    student_id: int,
    paid: bool | None = None,
):
    """Retrieve all fees for a specific student, optionally filtered by payment status."""
    # Build the query
    query = select(Fee).where(Fee.student_id == student_id)
    if paid is not None:
        query = query.where(Fee.fee_paid == paid)
    
    fees = db.exec(query).all()
    
    # Get student details once
    student = await get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found"
        )
    
    # Create response list
    response_list = []
    for fee in fees:
        class_name = db.exec(
            select(ClassNames)
            .where(ClassNames.class_name_id == fee.class_id)
        ).first()
        
        response = FeeResponse(
            fee_id=fee.fee_id,
            created_at=fee.created_at,
            student_name=student.student_name,
            father_name=student.father_name,
            class_name=class_name.class_name if class_name else None,
            fee_amount=fee.fee_amount,
            fee_month=fee.fee_month,
            fee_year=fee.fee_year,
            fee_paid=fee.fee_paid
        )
        response_list.append(response)
    
    return response_list

@fee_router.get("/total/collected", response_model=dict)
async def get_total_collected_fee(
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_admin)]
):
    """Get total amount of fees collected from all students."""
    # Get total of paid fees
    total = db.exec(
        select(func.sum(Fee.fee_amount))
        .where(Fee.fee_paid == True)
    ).first()
    
    # Handle case when no fees are paid yet
    total_amount = float(total) if total is not None else 0.0
    
    return {
        "total_collected": total_amount,
        "currency": "PKR"
    }