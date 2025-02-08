// import axiosIntance from "@/api/axiosInterceptorInstance";
import { ClassNameModel, CreateClassModel} from "@/models/className/className";
import AxiosInstance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ClassNameAPI {
  export const Get = async () => {
    try {
      const response = await AxiosInstance.get<ClassNameModel>(
        "/class_name/class-names-all/"
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
}
