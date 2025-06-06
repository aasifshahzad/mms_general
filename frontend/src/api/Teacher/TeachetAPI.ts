// import axiosIntance from "@/api/axiosInterceptorInstance";
import AxiosInstance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";
import { TeacherModel } from "@/models/teacher/Teacher";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TeacherNameAPI {
  export const Get = async () => {
    try {
      const response = await AxiosInstance.get<TeacherModel>(
        "/teacher_name/teacher-names-all/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          }
        }
      );
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  export const Create = async (ClassName: TeacherModel) => {
    try {
        ClassName = GetActionDetail(ClassName, "create");
      const response = await AxiosInstance.post<TeacherModel>(
        "/teacher_name/add_teacher_name/",
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
  export async function Delete(teacher_name: number) {
    try {
      const response = await AxiosInstance.delete(
        `/teacher_name/del/${teacher_name}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      return response;
    } catch (error) {
      return error;
    }
  }
}
