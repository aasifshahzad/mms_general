from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
from sqlmodel import Session, select, func
from datetime import datetime, date, timedelta
from typing import List
from db import get_session
from schemas.dashboard_model import (
    UserLoginSummary, AttendanceSummary, StudentSummary,
    IncomeExpenseCategorySummary, LoginGraphData, AttendanceGraphData,
    StudentGraphData, CategoryGraphData, GraphData, Dataset
)
from user.user_models import User
from schemas.attendance_model import Attendance, AttendanceValue
from schemas.students_model import Students
from schemas.income_model import Income
from schemas.expense_model import Expense

dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    responses={404: {"description": "Not found"}},
)

@dashboard_router.get("/user-roles", response_model=LoginGraphData)
def get_user_role_summary(session: Session = Depends(get_session)):
    """Fetch user role distribution summary."""
    try:
        stmt = select(User.role, func.count(User.role).label("role_count")).group_by(User.role)
        result = session.exec(stmt).all()
        
        # Create a mapping for proper role names
        role_mapping = {
            "ADMIN": "Admin",
            "TEACHER": "Teacher",
            "USER": "User"
        }
        
        # Process results with proper role names
        summary = [
            UserLoginSummary(
                username=role_mapping[str(row.role).split('.')[-1]],
                login_count=row.role_count
            ) for row in result
        ]
        
        labels = ["Admin", "Teacher", "User"]
        role_counts = {item.username: item.login_count for item in summary}
        values = [role_counts.get(label, 0) for label in labels]
        
        graph_data = GraphData(
            labels=labels,
            datasets=[Dataset(
                label="Users by Role",
                data=values,
                backgroundColor=[
                    "rgba(255, 99, 132, 0.5)",  # Red for Admin
                    "rgba(54, 162, 235, 0.5)",  # Blue for Teacher
                    "rgba(75, 192, 192, 0.5)",  # Green for User
                ],
                borderColor="rgba(0, 0, 0, 0.1)",
                borderWidth=1
            )],
            title="User Role Distribution"
        )
        
        return LoginGraphData(summary=summary, graph=graph_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching user role summary: {str(e)}"
        )

@dashboard_router.get("/attendance-summary", response_model=AttendanceGraphData)
def get_attendance_summary(session: Session = Depends(get_session)):
    """Fetch today's attendance summary with graph visualization."""
    try:
        today = datetime.utcnow().date()
        stmt = (
            select(
                Attendance.class_name_id,
                AttendanceValue.attendance_value,
                func.count(Attendance.attendance_id).label("count")
            )
            .join(AttendanceValue)
            .where(Attendance.attendance_date == today)
            .group_by(Attendance.class_name_id, AttendanceValue.attendance_value)
        )
        result = session.exec(stmt).all()
        
        class_data = {}
        for class_id, value, count in result:
            if class_id not in class_data:
                class_data[class_id] = {
                    "date": str(today),
                    "class_name": f"Class {class_id}",
                    "attendance_values": {}
                }
            class_data[class_id]["attendance_values"][value] = count
        
        summary = [AttendanceSummary(**data) for data in class_data.values()]
        
        colors = {
            "Present": "rgba(75, 192, 192, 0.5)",
            "Absent": "rgba(255, 99, 132, 0.5)",
            "Late": "rgba(255, 206, 86, 0.5)",
            "Sick": "rgba(153, 102, 255, 0.5)",
            "Leave": "rgba(255, 159, 64, 0.5)"
        }
        
        labels = list(class_data.keys())
        datasets = []
        attendance_types = set()
        
        for data in class_data.values():
            attendance_types.update(data["attendance_values"].keys())
        
        for att_type in attendance_types:
            datasets.append(Dataset(
                label=att_type,
                data=[class_data[class_id]["attendance_values"].get(att_type, 0) for class_id in labels],
                backgroundColor=colors.get(att_type, "rgba(201, 203, 207, 0.5)")
            ))
        
        graph_data = GraphData(
            labels=[f"Class {label}" for label in labels],
            datasets=datasets,
            title=f"Attendance Summary for {today}"
        )
        
        return AttendanceGraphData(summary=summary, graph=graph_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching attendance summary: {str(e)}"
        )

@dashboard_router.get("/student-summary", response_model=StudentGraphData)
def get_student_summary(
    date: date = Query(default=None),
    session: Session = Depends(get_session)
):
    """Fetch student summary with graph visualization for a specific date."""
    try:
        # Use today's date if no date provided
        selected_date = date or datetime.utcnow().date()
        
        total_students = session.exec(select(func.count(Students.student_id))).first()
        
        attendance_counts = session.exec(
            select(AttendanceValue.attendance_value, func.count(Attendance.attendance_id))
            .join(AttendanceValue)
            .join(Attendance)
            .where(Attendance.attendance_date == selected_date)
            .group_by(AttendanceValue.attendance_value)
        ).all()
        
        summary_data = {value: count for value, count in attendance_counts}
        summary = StudentSummary(
            total_students=total_students or 0,
            present=summary_data.get("Present", 0),
            absent=summary_data.get("Absent", 0),
            late=summary_data.get("Late", 0),
            sick=summary_data.get("Sick", 0),
            leave=summary_data.get("Leave", 0)
        )
        
        graph_data = GraphData(
            labels=["Present", "Absent", "Late", "Sick", "Leave"],
            datasets=[Dataset(
                label=f"Student Attendance for {selected_date}",
                data=[
                    summary.present, summary.absent,
                    summary.late, summary.sick, summary.leave
                ],
                backgroundColor=[
                    "rgba(75, 192, 192, 0.5)",  # Present
                    "rgba(255, 99, 132, 0.5)",  # Absent
                    "rgba(255, 206, 86, 0.5)",  # Late
                    "rgba(153, 102, 255, 0.5)", # Sick
                    "rgba(255, 159, 64, 0.5)"   # Leave
                ]
            )],
            title=f"Student Attendance Distribution for {selected_date}"
        )
        
        return StudentGraphData(summary=summary, graph=graph_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching student summary: {str(e)}"
        )

@dashboard_router.get("/income-summary", response_model=CategoryGraphData)
def get_income_summary(year: int, month: int, session: Session = Depends(get_session)):
    """Fetch income summary with graph visualization."""
    try:
        stmt = (
            select(
                Income.category_id,
                func.sum(Income.amount).label("total_amount")
            )
            .where(
                func.extract("year", Income.date) == year,
                func.extract("month", Income.date) == month
            )
            .group_by(Income.category_id)
        )
        result = session.exec(stmt).all()
        
        category_summary = {row.category_id: row.total_amount for row in result}
        total = sum(category_summary.values())
        
        graph_data = GraphData(
            labels=[f"Category {cat_id}" for cat_id in category_summary.keys()],
            datasets=[Dataset(
                label="Income Amount",
                data=list(category_summary.values()),
                backgroundColor="rgba(75, 192, 192, 0.5)",
                borderColor="rgba(75, 192, 192, 1)",
                borderWidth=1
            )],
            title=f"Income Summary for {year}-{month}"
        )
        
        return CategoryGraphData(
            summary=[IncomeExpenseCategorySummary(
                year=year,
                month=month,
                category_summary=category_summary
            )],
            graph=graph_data,
            total=total
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching income summary: {str(e)}"
        )

@dashboard_router.get("/expense-summary", response_model=CategoryGraphData)
def get_expense_summary(year: int, month: int, session: Session = Depends(get_session)):
    """Fetch expense summary with graph visualization."""
    try:
        stmt = (
            select(
                Expense.category_id,
                func.sum(Expense.amount).label("total_amount")
            )
            .where(
                func.extract("year", Expense.date) == year,
                func.extract("month", Expense.date) == month
            )
            .group_by(Expense.category_id)
        )
        result = session.exec(stmt).all()
        
        category_summary = {row.category_id: row.total_amount for row in result}
        total = sum(category_summary.values())
        
        graph_data = GraphData(
            labels=[f"Category {cat_id}" for cat_id in category_summary.keys()],
            datasets=[Dataset(
                label="Expense Amount",
                data=list(category_summary.values()),
                backgroundColor="rgba(255, 99, 132, 0.5)",
                borderColor="rgba(255, 99, 132, 1)",
                borderWidth=1
            )],
            title=f"Expense Summary for {year}-{month}"
        )
        
        return CategoryGraphData(
            summary=[IncomeExpenseCategorySummary(
                year=year,
                month=month,
                category_summary=category_summary
            )],
            graph=graph_data,
            total=total
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching expense summary: {str(e)}"
        )

@dashboard_router.get("/graph-test", response_class=HTMLResponse)
async def get_graph_test():
    return """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Dashboard Graphs</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                .chart-container {
                    margin: 20px 0;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                h2 {
                    text-align: center;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div style="width: 800px; margin: 20px auto;">
                <div class="chart-container">
                    <h2>User Role Distribution</h2>
                    <canvas id="userRolesChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Student Attendance</h2>
                    <div style="text-align: center; margin-bottom: 10px;">
                        <label>Date: <input type="date" id="attendanceDate"></label>
                        <button onclick="updateStudentChart()">Update</button>
                    </div>
                    <canvas id="studentChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Class-wise Attendance</h2>
                    <canvas id="attendanceChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Financial Summary</h2>
                    <canvas id="incomeChart"></canvas>
                </div>
            </div>
            <script>
                // Store chart instances
                let charts = {
                    userRoles: null,
                    student: null,
                    attendance: null,
                    income: null
                };

                function destroyChart(chartId) {
                    if (charts[chartId]) {
                        charts[chartId].destroy();
                        charts[chartId] = null;
                    }
                }

                async function updateStudentChart() {
                    const date = document.getElementById('attendanceDate').value;
                    
                    if (!date) {
                        alert('Please select a date');
                        return;
                    }

                    const url = `/auth/dashboard/student-summary?date=${date}`;
                    try {
                        const response = await fetch(url);
                        const data = await response.json();
                        
                        destroyChart('student');
                        
                        const ctx = document.getElementById('studentChart');
                        charts.student = new Chart(ctx, {
                            type: 'bar',
                            data: data.graph,
                            options: { 
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });
                    } catch (error) {
                        console.error('Error fetching student data:', error);
                        alert('Error updating chart. Please try again.');
                    }
                }

                // Initialize with today's date
                document.getElementById('attendanceDate').valueAsDate = new Date();

                async function fetchAndRenderGraphs() {
                    try {
                        // User roles chart
                        const rolesRes = await fetch('/auth/dashboard/user-roles');
                        const rolesData = await rolesRes.json();
                        destroyChart('userRoles');
                        charts.userRoles = new Chart(document.getElementById('userRolesChart'), {
                            type: 'bar',
                            data: rolesData.graph,
                            options: { responsive: true }
                        });

                        // Initial student chart
                        await updateStudentChart();

                        // Class attendance chart
                        const attendanceRes = await fetch('/auth/dashboard/attendance-summary');
                        const attendanceData = await attendanceRes.json();
                        destroyChart('attendance');
                        charts.attendance = new Chart(document.getElementById('attendanceChart'), {
                            type: 'bar',
                            data: attendanceData.graph,
                            options: { responsive: true }
                        });

                        // Income chart
                        const year = new Date().getFullYear();
                        const month = new Date().getMonth() + 1;
                        const incomeRes = await fetch(`/auth/dashboard/income-summary?year=${year}&month=${month}`);
                        const incomeData = await incomeRes.json();
                        destroyChart('income');
                        charts.income = new Chart(document.getElementById('incomeChart'), {
                            type: 'bar',
                            data: incomeData.graph,
                            options: { responsive: true }
                        });
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                }

                fetchAndRenderGraphs();
            </script>
        </body>
    </html>
    """
