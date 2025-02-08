import { MarkAttInput } from "@/models/markattendace/markattendance";
import { GetActionDetail } from "@/utils/GetActionDetail";
import AxiosInstance from "@/api/axiosInterceptorInstance";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AttendanceAPI {
export const Create = async (ClassName: MarkAttInput) => {
    try {
        ClassName = GetActionDetail(ClassName, "create");
      const response = await AxiosInstance.post<MarkAttInput>(
        "/class_name/add_class_name/",
        JSON.stringify(ClassName),
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