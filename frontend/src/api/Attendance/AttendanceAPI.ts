import { MarkAttInput } from "@/models/markattendace/markattendance";
import { GetActionDetail } from "@/utils/GetActionDetail";
import AxiosInstance from "@/api/axiosInterceptorInstance";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AttendanceAPI {
export const Create = async (Attendances: MarkAttInput) => {
    try {
      Attendances = GetActionDetail(Attendances, "create");
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
}