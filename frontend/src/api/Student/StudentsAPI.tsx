import { StudentModel, CreateStudent} from "@/models/students/Student";
import AxiosInstance from "@/api/axiosInterceptorInstance";

// Define the StudentResponse type
interface StudentResponse {
  id: number;
  name: string;
  // Add other student properties as needed
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace StudentAPI {
  export const Get = async () => {
    try {
      const response = await AxiosInstance.get<StudentModel>(
        "/students/all_students/",
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

  export const Create = async (AddStudent: CreateStudent) => {
    try {
        // ClassName = GetActionDetail(ClassName, "create");
      const response = await AxiosInstance.post<CreateStudent>(
        "/students/add/",
        JSON.stringify(AddStudent),
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

  export async function Delete(student_id: number) {
    try {
      const response = await AxiosInstance.delete(
        `/students/${student_id}`,
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
  export async function GetStudentbyFilter(class_id: number) {
    try {
      const response = await AxiosInstance.get(
        `/students/by_class_id/?class_id=${class_id}`,
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

  export async function GetByClassId(classId: number): Promise<{ data: StudentResponse[] }> {
    try {
      const response = await AxiosInstance.get(
        `/students/by_class_id/?class_id=${classId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching students by class ID:", error);
      throw error;
    }
  }
}

