import { MarkAttInput } from "@/models/markattendace/markattendance";
import AxiosInstance from "@/api/axiosInterceptorInstance";

interface FilteredAttendance {
  attendance_date: string;
  attendance_time_id: number;
  class_name_id: number;
  teacher_name_id: number;
  student_id: number;
  father_name: string;
  attendance_value_id: number;
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
        `/mark_attendance/filter_attendance_by_ids?attendance_date=${FilteredAttendance.attendance_date}&attendance_time_id=${FilteredAttendance.attendance_time_id}&class_name_id=${FilteredAttendance.class_name_id}&teacher_name_id=${FilteredAttendance.teacher_name_id}&student_id=${FilteredAttendance.student_id}&father_name=${FilteredAttendance.father_name}&attendance_value_id=${FilteredAttendance.attendance_value_id}`,
      );
      return response;
    }
    catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}