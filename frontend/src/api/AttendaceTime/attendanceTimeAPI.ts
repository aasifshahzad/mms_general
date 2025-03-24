// import axiosIntance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";
import AxiosInstance from "@/api/axiosInterceptorInstance";
import { ClassTiming, CreateTiming } from "@/models/classTiming/classTiming";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AttendanceTimeAPI {
  export const Get = async () => {
    try {
      
      const response = await AxiosInstance.get<ClassTiming>(
        "/attendance_time/attendance-values-all/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          }
        }
      );
      console.log("API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  }

  export const Create = async (ClassName: CreateTiming) => {
    try {
        ClassName = GetActionDetail(ClassName, "create");
      const response = await AxiosInstance.post<CreateTiming>(
        "/attendance_time/add_attendance_value/",
        JSON.stringify(ClassName),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("API Response:", response);
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error; 
    }
  };
};