import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from sqlmodel import Session
from main import app
from db import get_session
from tests.config import override_get_session, engine
from user.user_models import UserRole

# Setup test client with session override
app.dependency_overrides[get_session] = override_get_session
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    """Setup and teardown the database for each test."""
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)  # Create tables
    yield
    SQLModel.metadata.drop_all(engine)  # Drop tables after the test

# Fixtures
@pytest.fixture
def admin_token():
    """Get admin token."""
    response = client.post("/auth/login", data={
        "username": "admin",
        "password": "adminpass123"
    })
    return response.json()["access_token"]

@pytest.fixture
def teacher_token():
    """Get teacher token."""
    response = client.post("/auth/login", data={
        "username": "teacher1",
        "password": "teacherpass123"
    })
    return response.json()["access_token"]

# Test Authentication Routes
def test_user_signup():
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "role": "USER"
    }
    response = client.post("/auth/signup", json=user_data)
    assert response.status_code == 200
    assert response.json()["username"] == user_data["username"]

# Test Student Routes
def test_create_student(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    student_data = {
        "student_name": "Test Student",
        "student_date_of_birth": "2010-01-01",
        "student_gender": "Male",
        "student_age": 13,
        "student_education": "Primary",
        "class_name": "5A",
        "student_city": "Test City",
        "student_address": "Test Address",
        "father_name": "Test Father",
        "father_occupation": "Test Job",
        "father_cnic": "12345-1234567-1",
        "father_contact": "1234567890"
    }
    response = client.post("/students/add/", json=student_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["student_name"] == student_data["student_name"]

def test_get_all_students(teacher_token):
    headers = {"Authorization": f"Bearer {teacher_token}"}
    response = client.get("/students/all_students/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test Attendance Routes
def test_mark_attendance(teacher_token):
    headers = {"Authorization": f"Bearer {teacher_token}"}
    attendance_data = {
        "attendance_date": datetime.now().date().isoformat(),
        "attendance_time_id": 1,
        "class_name_id": 1,
        "teacher_name_id": 1,
        "student_id": 1,
        "attendance_value_id": 1
    }
    response = client.post(
        "/mark_attendance/add_attendance/", 
        json=attendance_data,
        headers=headers
    )
    assert response.status_code == 200

def test_get_attendance(teacher_token):
    headers = {"Authorization": f"Bearer {teacher_token}"}
    response = client.get(
        "/mark_attendance/show_all_attendance",
        headers=headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test Class Names Routes
def test_create_class(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    class_data = {"class_name": "Test Class"}
    response = client.post(
        "/class_name/add_class_name/", 
        json=class_data,
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["class_name"] == class_data["class_name"]

# Test Teacher Names Routes
def test_create_teacher(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    teacher_data = {"teacher_name": "Test Teacher"}
    response = client.post(
        "/teacher_name/add_teacher_name/", 
        json=teacher_data,
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["teacher_name"] == teacher_data["teacher_name"]

# Test Attendance Value Routes
def test_create_attendance_value(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    value_data = {"attendance_value": "Present"}
    response = client.post(
        "/attendance_value/add_attendance_value/", 
        json=value_data,
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["attendance_value"] == value_data["attendance_value"]

# Test Error Cases
def test_unauthorized_access():
    response = client.get("/students/all_students/")
    assert response.status_code == 401

def test_forbidden_access():
    # Login as regular user
    response = client.post("/auth/login", data={
        "username": "user1",
        "password": "userpass123"
    })
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to access admin-only route
    response = client.post(
        "/students/add/",
        json={"student_name": "Test"},
        headers=headers
    )
    assert response.status_code == 403