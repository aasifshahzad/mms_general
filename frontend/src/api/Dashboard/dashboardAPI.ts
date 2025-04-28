import AxiosInstance from "@/api/axiosInterceptorInstance";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DashboardAPI {
  export const GetUserRoles = async () => {
    try {
      const response = await AxiosInstance.get("/auth/dashboard/user-roles", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  };
  export const GetStudentSummary = async (date: string) => {
    try {
      const response = await AxiosInstance.get(
        `/auth/dashboard/student-summary?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("Student Summary API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  };
  export const GetAttendanceSummary = async () => {
    try {
      const response = await AxiosInstance.get(
        "/auth/dashboard/attendance-summary",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("Attendance Summary API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  };
  export const GetIncomeExpenseSummary = async (year: number) => {
    try {
      const response = await AxiosInstance.get(
        `/auth/dashboard/income-expense-summary?year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("Income Expense Summary API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  };
  export const GetFeeSummary = async (year: number) => {
    try {
      const response = await AxiosInstance.get(
        `/auth/dashboard/fee-summary?year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("Fee Summary API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  };
  export const GetIncomeSummary = async (year: number, month?: number) => {
    try {
      let url = `/auth/dashboard/income-summary?year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }
      
      const response = await AxiosInstance.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          }
        }
      );
      console.log("Income Summary API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  }
  export const GetExpenseSummary = async (year: number, month?: number) => {
    try {
      let url = `/auth/dashboard/expense-summary?year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }
      
      const response = await AxiosInstance.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          }
        }
      );
      console.log("Expense Summary API Response:", response);
      return response;
    } catch (error) {
      return error;
    }
  }
}