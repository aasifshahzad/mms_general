from typing import Optional
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel import Session, select
from schemas.students_model import Students
from schemas.class_names_model import ClassNames
from router.students import get_student_by_id  # Add this import at the top
from sqlalchemy import func
from datetime import datetime

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

@fee_router.get("/status/{paid}", response_model=List[FeeResponse])
async def get_fees_by_payment_status(
    paid: bool,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_authenticated_user)]
):
    """Retrieve all fees by payment status (paid/unpaid)."""
    try:
        response_list = []

        if paid:
            # Get all paid fees from fee table
            fees = db.exec(select(Fee).where(Fee.fee_paid == True)).all()
            
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
        else:
            # Get all students
            all_students = db.exec(select(Students)).all()
            current_month = datetime.now().month
            current_year = datetime.now().year
            
            for student in all_students:
                # Check if student has paid fee for current month
                fee_exists = db.exec(
                    select(Fee)
                    .where(
                        Fee.student_id == student.student_id,
                        Fee.fee_month == current_month,
                        Fee.fee_year == current_year,
                        Fee.fee_paid == True
                    )
                ).first()
                
                # If no fee record exists or fee is not paid, add to unpaid list
                if not fee_exists:
                    class_name = db.exec(
                        select(ClassNames)
                        .where(ClassNames.class_name == student.class_name)
                    ).first()
                    
                    response = FeeResponse(
                        fee_id=0,  # No fee record exists
                        created_at=datetime.now(),
                        student_name=student.student_name,
                        father_name=student.father_name,
                        class_name=student.class_name,
                        fee_amount=0.0,  # Fee amount not set
                        fee_month=current_month,
                        fee_year=current_year,
                        fee_paid=False
                    )
                    response_list.append(response)
        
        return response_list

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving fees: {str(e)}"
        )

@fee_router.get("/filter_status/{paid}", response_model=List[FeeResponse])
async def get_filtered_fees_by_status(
    paid: bool,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_authenticated_user)],
    student_name: Optional[str] = None,
    father_name: Optional[str] = None,
    class_name: Optional[str] = None,
    fee_amount: Optional[float] = None,
    fee_month: Optional[int] = None,
    fee_year: Optional[int] = None
):
    """Retrieve filtered fees by payment status and optional filters."""
    try:
        response_list = []

        if paid:
            # Base query for paid fees
            query = select(Fee).where(Fee.fee_paid == True)
            
            # Apply filters to paid fees
            fees = db.exec(query).all()
            for fee in fees:
                student = await get_student_by_id(db, fee.student_id)
                class_obj = db.exec(
                    select(ClassNames)
                    .where(ClassNames.class_name_id == fee.class_id)
                ).first()
                
                # Apply filters
                if (student_name and student_name.lower() not in student.student_name.lower()) or \
                   (father_name and father_name.lower() not in student.father_name.lower()) or \
                   (class_name and class_name.lower() != class_obj.class_name.lower()) or \
                   (fee_amount and fee_amount != fee.fee_amount) or \
                   (fee_month and fee_month != fee.fee_month) or \
                   (fee_year and fee_year != fee.fee_year):
                    continue
                
                response = FeeResponse(
                    fee_id=fee.fee_id,
                    created_at=fee.created_at,
                    student_name=student.student_name,
                    father_name=student.father_name,
                    class_name=class_obj.class_name,
                    fee_amount=fee.fee_amount,
                    fee_month=fee.fee_month,
                    fee_year=fee.fee_year,
                    fee_paid=fee.fee_paid
                )
                response_list.append(response)
        else:
            # Get all students
            query = select(Students)
            
            # Apply name and class filters to student query
            if student_name:
                query = query.where(Students.student_name.contains(student_name))
            if father_name:
                query = query.where(Students.father_name.contains(father_name))
            if class_name:
                query = query.where(Students.class_name == class_name)
                
            all_students = db.exec(query).all()
            current_month = fee_month or datetime.now().month
            current_year = fee_year or datetime.now().year
            
            for student in all_students:
                # Check for unpaid fees
                fee_exists = db.exec(
                    select(Fee).where(
                        Fee.student_id == student.student_id,
                        Fee.fee_month == current_month,
                        Fee.fee_year == current_year,
                        Fee.fee_paid == True
                    )
                ).first()
                
                # If no fee record exists or doesn't match filter criteria
                if not fee_exists:
                    if fee_amount and fee_amount != 0.0:
                        continue
                        
                    response = FeeResponse(
                        fee_id=0,
                        created_at=datetime.now(),
                        student_name=student.student_name,
                        father_name=student.father_name,
                        class_name=student.class_name,
                        fee_amount=0.0,
                        fee_month=current_month,
                        fee_year=current_year,
                        fee_paid=False
                    )
                    response_list.append(response)
        
        return response_list

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving filtered fees: {str(e)}"
        )
    

# @fee_router.get("/search/filter", response_model=List[FeeResponse])
# async def get_filtered_fees(
#     db: Annotated[Session, Depends(get_session)],
#     current_user: Annotated[User, Depends(check_authenticated_user)],
#     paid: Optional[bool] = None,
#     student_name: Optional[str] = None,
#     father_name: Optional[str] = None,
#     class_name: Optional[str] = None,
#     fee_amount: Optional[float] = None,
#     fee_month: Optional[int] = None,
#     fee_year: Optional[int] = None
# ):
#     """Retrieve filtered fees with optional payment status and other filters."""
#     try:
#         response_list = []
#         current_month = fee_month or datetime.now().month
#         current_year = fee_year or datetime.now().year

#         # Start with students query
#         query = select(Students)
        
#         # Apply student-related filters
#         if student_name:
#             query = query.where(Students.student_name.contains(student_name))
#         if father_name:
#             query = query.where(Students.father_name.contains(father_name))
#         if class_name:
#             query = query.where(Students.class_name == class_name)
            
#         students = db.exec(query).all()
        
#         for student in students:
#             # Get fee record if exists
#             fee_query = select(Fee).where(
#                 Fee.student_id == student.student_id,
#                 Fee.fee_month == current_month,
#                 Fee.fee_year == current_year
#             )
            
#             if fee_amount:
#                 fee_query = fee_query.where(Fee.fee_amount == fee_amount)
                
#             fee = db.exec(fee_query).first()
            
#             # Skip based on paid filter
#             if paid is not None:
#                 if paid and (not fee or not fee.fee_paid):
#                     continue
#                 if not paid and fee and fee.fee_paid:
#                     continue
            
#             # Skip if fee amount filter doesn't match
#             if fee_amount and (not fee or fee.fee_amount != fee_amount):
#                 continue
                
#             # Create response object
#             response = FeeResponse(
#                 fee_id=fee.fee_id if fee else 0,
#                 created_at=fee.created_at if fee else datetime.now(),
#                 student_name=student.student_name,
#                 father_name=student.father_name,
#                 class_name=student.class_name,
#                 fee_amount=fee.fee_amount if fee else 0.0,
#                 fee_month=fee.fee_month if fee else current_month,
#                 fee_year=fee.fee_year if fee else current_year,
#                 fee_paid=fee.fee_paid if fee else False
#             )
#             response_list.append(response)
        
#         return response_list

#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error retrieving filtered fees: {str(e)}"
#         )

@fee_router.get("/search/filter", response_model=List[FeeResponse])
async def get_filtered_fees(
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_authenticated_user)],
    paid: Optional[bool] = None,
    student_name: Optional[str] = None,
    father_name: Optional[str] = None,
    class_name: Optional[str] = None,
    fee_amount: Optional[float] = None,
    fee_month: Optional[int] = None,
    fee_year: Optional[int] = None
):
    """Retrieve filtered fees with optional payment status and other filters."""
    try:
        response_list = []
        current_month = fee_month or datetime.now().month
        current_year = fee_year or datetime.now().year

        # Get all students matching the filter criteria
        student_query = select(Students)
        if student_name:
            student_query = student_query.where(Students.student_name.contains(student_name))
        if father_name:
            student_query = student_query.where(Students.father_name.contains(father_name))
        if class_name:
            student_query = student_query.where(Students.class_name == class_name)
        
        students = db.exec(student_query).all()
        
        for student in students:
            # Get the latest fee record for the student
            fee_query = select(Fee).where(
                Fee.student_id == student.student_id,
                Fee.fee_month == current_month,
                Fee.fee_year == current_year
            )
            fee = db.exec(fee_query).first()

            # Skip if paid filter is True and no fee record or unpaid
            if paid is True and (not fee or not fee.fee_paid):
                continue
            
            # Skip if paid filter is False and fee exists and is paid
            if paid is False and fee and fee.fee_paid:
                continue
            
            # Skip if fee amount filter doesn't match
            if fee_amount and (not fee or fee.fee_amount != fee_amount):
                continue

            class_obj = db.exec(
                select(ClassNames)
                .where(ClassNames.class_name == student.class_name)
            ).first()

            response = FeeResponse(
                fee_id=fee.fee_id if fee else 0,
                created_at=fee.created_at if fee else datetime.now(),
                student_name=student.student_name,
                father_name=student.father_name,
                class_name=student.class_name,
                fee_amount=fee.fee_amount if fee else 0.0,
                fee_month=fee.fee_month if fee else current_month,
                fee_year=fee.fee_year if fee else current_year,
                fee_paid=fee.fee_paid if fee else False
            )
            response_list.append(response)

        return response_list

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving filtered fees: {str(e)}"
        )