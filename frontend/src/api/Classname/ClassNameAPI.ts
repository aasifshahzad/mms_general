// import axiosIntance from "@/api/axiosInterceptorInstance";
import { ClassNameModel, CreateClassModel} from "@/models/className/className";
import AxiosInstance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ClassNameAPI {
  export const Get = async () => {
    try {
      const response = await AxiosInstance.get<ClassNameModel>(
        "/class_name/class-names-all/",
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
  };

  export const Create = async (ClassName: CreateClassModel) => {
    try {
        ClassName = GetActionDetail(ClassName, "create");
      const response = await AxiosInstance.post<CreateClassModel>(
        "/class_name/add_class_name/",
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

  export const Delete = async (id: number) => {
    try {
      const response = await AxiosInstance.delete(
        `/class_name/delete_class_name/${id}/`,
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
  };
}
