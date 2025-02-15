import { MarkAttInput } from "@/models/markattendace/markattendance";
import { GetActionDetail } from "@/utils/GetActionDetail";
import AxiosInstance from "@/api/axiosInterceptorInstance";

interface FilteredAttendance {
  class_name: string;
  teacher_name: string;
  Teacher: string;
  student_name: string;
  attendance_value: string;
  attendance_date: string;
  attendance_time: string;
  attendance_id: number;
}
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AttendanceAPI {
export const Create = async (Attendances: MarkAttInput) => {
    try {
      const response = await AxiosInstance.post<MarkAttInput>(
        "/mark_attendance/add_bulk_attendance/",
        JSON.stringify(Attendances),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response);
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error; 
    }
  }
  export const GetbyFilter = async (FilteredAttendance: FilteredAttendance) => {
    try {
      const response = await AxiosInstance.get<FilteredAttendance>(
        `/mark_attendance/filtered_attendance?class_name=${FilteredAttendance.class_name}&teacher_name=${FilteredAttendance.teacher_name}&student_name=${FilteredAttendance.student_name}&attendance_date=${FilteredAttendance.attendance_date}&attendance_time=${FilteredAttendance.attendance_time}`,
      );
      console.log("API Response:", response);
      return response;
    }
    catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}