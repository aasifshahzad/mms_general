import streamlit as st
import requests
import json

# Backend base URL
BASE_URL = "http://localhost:8000"  # Update if needed

st.title("Attendance Management System")

# --- Helper Functions ---
def make_request(method, endpoint, data=None):
    """Helper function to make API requests."""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        else:
            st.error(f"Invalid method: {method}")
            return None
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        if response.status_code == 204:
            return {"message": "Success"}
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error making request to {url}: {e}")
        return None

# --- Attendance Time ---
st.header("Attendance Time")
if st.button("Get All Attendance Times"):
    attendance_times = make_request("GET", "/attendance_time/all/")
    if attendance_times:
        st.write(attendance_times)

with st.expander("Create Attendance Time"):
    with st.form("create_attendance_time_form"):
        attendance_time = st.text_input("Attendance Time (e.g., '9:00 AM')")
        submitted = st.form_submit_button("Create")
        if submitted:
            if attendance_time:
                new_attendance_time = make_request("POST", "/attendance_time/", data={"attendance_time": attendance_time})
                if new_attendance_time:
                    st.success("Attendance time created successfully!")
            else:
                st.error("Please enter attendance time")

# --- Class Names ---
st.header("Class Names")
if st.button("Get All Class Names"):
    class_names = make_request("GET", "/class_names/all/")
    if class_names:
        st.write(class_names)

with st.expander("Create Class Name"):
    with st.form("create_class_name_form"):
        class_name = st.text_input("Class Name (e.g., 'Class A')")
        submitted = st.form_submit_button("Create")
        if submitted:
            if class_name:
                new_class_name = make_request("POST", "/class_names/", data={"class_name": class_name})
                if new_class_name:
                    st.success("Class name created successfully!")
            else:
                st.error("Please enter class name")


# --- Teacher Names ---
st.header("Teacher Names")
if st.button("Get All Teacher Names"):
    teacher_names = make_request("GET", "/teacher_names/all/")
    if teacher_names:
        st.write(teacher_names)

with st.expander("Create Teacher Name"):
    with st.form("create_teacher_name_form"):
        teacher_name = st.text_input("Teacher Name (e.g., 'Mr. Smith')")
        submitted = st.form_submit_button("Create")
        if submitted:
            if teacher_name:
                new_teacher_name = make_request("POST", "/teacher_names/", data={"teacher_name": teacher_name})
                if new_teacher_name:
                    st.success("Teacher name created successfully!")
            else:
                st.error("Please enter teacher name")

# --- Student Names ---
st.header("Student Names")
if st.button("Get All Student Names"):
    student_names = make_request("GET", "/students/all/")
    if student_names:
        st.write(student_names)

with st.expander("Create Student"):
    with st.form("create_student_form"):
        student_name = st.text_input("Student Name (e.g., 'John Doe')")
        father_name = st.text_input("Father Name (e.g., 'John Doe Sr.')")
        submitted = st.form_submit_button("Create")
        if submitted:
            if student_name and father_name:
                new_student = make_request("POST", "/students/", data={"student_name": student_name, "father_name": father_name})
                if new_student:
                    st.success("Student created successfully!")
            else:
                st.error("Please enter student and father name")

# --- Attendance Values ---
st.header("Attendance Values")
if st.button("Get All Attendance Values"):
    attendance_values = make_request("GET", "/attendance_value/all/")
    if attendance_values:
        st.write(attendance_values)

with st.expander("Create Attendance Value"):
    with st.form("create_attendance_value_form"):
        attendance_value = st.text_input("Attendance Value (e.g., 'Present')")
        submitted = st.form_submit_button("Create")
        if submitted:
            if attendance_value:
                new_attendance_value = make_request("POST", "/attendance_value/", data={"attendance_value": attendance_value})
                if new_attendance_value:
                    st.success("Attendance value created successfully!")
            else:
                st.error("Please enter attendance value")

# --- Mark Attendance ---
st.header("Mark Attendance")
if st.button("Get Filtered Attendance"):
    filtered_attendance = make_request("GET", "/attendance/filtered/")
    if filtered_attendance:
        st.write(filtered_attendance)

with st.expander("Create Attendance Record"):
    with st.form("create_attendance_form"):
        attendance_date = st.date_input("Attendance Date")
        attendance_time_id = st.number_input("Attendance Time ID", step=1, min_value=1)
        attendance_class_id = st.number_input("Class ID", step=1, min_value=1)
        attendance_teacher_id = st.number_input("Teacher ID", step=1, min_value=1)
        attendance_student_id = st.number_input("Student ID", step=1, min_value=1)
        attendance_value_id = st.number_input("Attendance Value ID", step=1, min_value=1)
        submitted = st.form_submit_button("Create Attendance")
        if submitted:
            attendance_data = {
                "attendance_date": str(attendance_date),
                "attendance_time_id": attendance_time_id,
                "attendance_class_id": attendance_class_id,
                "attendance_teacher_id": attendance_teacher_id,
                "attendance_student_id": attendance_student_id,
                "attendance_value_id": attendance_value_id,
            }
            new_attendance = make_request("POST", "/attendance/", data=attendance_data)
            if new_attendance:
                st.success("Attendance record created successfully!")

# --- Payment ---
st.header("Payment")
if st.button("Get All Payments"):
    payments = make_request("GET", "/payment/all/")
    if payments:
        st.write(payments)

with st.expander("Create Payment"):
    with st.form("create_payment_form"):
        created_at = st.text_input("Created At (e.g., '2024-07-31T12:19:50.577337')")
        card_num = st.number_input("Card Number")
        cvv = st.number_input("CVV")
        valid_thru_month = st.number_input("Valid Thru Month")
        valid_thru_year = st.number_input("Valid Thru Year")
        total_price = st.number_input("Total Price")
        status = st.text_input("Status (e.g., 'pending')")
        submitted = st.form_submit_button("Create Payment")
        if submitted:
            payment_data = {
                "created_at": created_at,
                "card_num": card_num,
                "cvv": cvv,
                "valid_thru_month": valid_thru_month,
                "valid_thru_year": valid_thru_year,
                "total_price": total_price,
                "status": status,
            }
            new_payment = make_request("POST", "/payment/pay-now/", data=payment_data)
            if new_payment:
                st.success("Payment created successfully!")
