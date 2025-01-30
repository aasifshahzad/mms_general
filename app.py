import streamlit as st
import requests

# Backend base URL
BASE_URL = "http://localhost:8000"  # Update if needed

st.title("Attendance Management System")

# Example: Fetch attendance time
if st.button("Get Attendance Time"):
    response = requests.get(f"{BASE_URL}/attendance_time")
    if response.status_code == 200:
        st.write(response.json())
    else:
        st.write("Error fetching attendance time")
