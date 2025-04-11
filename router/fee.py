from typing import Optional
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlmodel import Session, select
from router.class_names import get_class_name
from schemas.students_model import Students
from schemas.class_names_model import ClassNames
from router.students import get_student_by_id, get_student_details  # Add this import at the top
from sqlalchemy import func

from db import get_session
from schemas.fee_model import Fee, FeeCreate, FeeResponse, FeeStatus, FeeUpdateRequest, FeeFilter
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
            fee_status=fee.fee_status
        )
        response_list.append(response)
    
    return response_list


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

        # Set fee status based on payment
        fee_data_dict = fee_data.model_dump()
        if fee_data.fee_amount > 0:
            fee_data_dict['fee_status'] = 'Paid'
        else:
            fee_data_dict['fee_status'] = 'Unpaid'

        new_fee = Fee(**fee_data_dict)
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
            fee_status=new_fee.fee_status
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

@fee_router.delete("/delete_fee/{fee_id}", response_model=dict, status_code=status.HTTP_200_OK)
async def delete_fee(
    fee_id: int,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_admin)]
):
    """Delete a student fee record by ID (Admin only)."""
    try:
        fee = db.exec(select(Fee).where(Fee.fee_id == fee_id)).first()
        if not fee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Fee record with ID {fee_id} not found"
            )

        db.delete(fee)
        db.commit()
        return {"message": "Fee deleted successfully"}
       
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting fee record: {str(e)}"
        )

@fee_router.post("/filter/", response_model=List[FeeResponse])
async def filter_fees(
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_admin)],
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    class_id: Optional[int] = Query(None, description="Filter by class ID"),
    fee_month: Optional[str] = Query(None, description="Filter by fee month"),
    fee_year: Optional[str] = Query(None, description="Filter by fee year"),
    fee_status: Optional[str] = Query(None, description="Filter by fee status"),
):
    """Filter student fee records based on provided criteria (Admin only)."""
    try:
        # Build the query based on provided filter criteria
        query = select(Fee)
        if student_id:
            query = query.where(Fee.student_id == student_id)
        if class_id:
            query = query.where(Fee.class_id == class_id)
        if fee_month:
            query = query.where(Fee.fee_month == fee_month)
        if fee_year:
            query = query.where(Fee.fee_year == fee_year)
        if fee_status:
            query = query.where(Fee.fee_status == fee_status)

        # Execute the query and fetch the results
        fees = db.exec(query).all()

        filtered_response = []
        for fee in fees:
            student_details = get_student_details(db, fee.student_id)
            class_name = get_class_name(db, fee.class_id)

            filtered_response.append(
                FeeResponse(
                    fee_id=fee.fee_id,
                    created_at=fee.created_at,
                    student_name=student_details["student_name"] if student_details else None,
                    father_name=student_details["father_name"] if student_details else None,
                    class_name=class_name,
                    fee_amount=fee.fee_amount,
                    fee_month=fee.fee_month,
                    fee_year=fee.fee_year,
                    fee_status=fee.fee_status
                )
            )
        
        return filtered_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error filtering fee records: {str(e)}"
        )

@fee_router.get("/total/collected", response_model=dict)
async def get_total_collected_fee(
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(check_admin)],
    year: str = Query(..., description="Filter by fee year")  # Year is now required
):
    """Get total amount of fees collected month-wise for a specific year."""
    # Query to group by month and sum the fee amounts
    results = db.exec(
        select(Fee.fee_month, func.sum(Fee.fee_amount))
        .where(Fee.fee_status == 'Paid', Fee.fee_year == year)
        .group_by(Fee.fee_month)
        .order_by(Fee.fee_month)
    ).all()
    
    # Format the results into a dictionary
    month_wise_summary = {month: float(total) for month, total in results}

    return {
        "year": year,
        "month_wise_summary": month_wise_summary,
        "currency": "PKR"
    }