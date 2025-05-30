import AxiosInstance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";
import { AddExpenseModel, ExpenseCategory } from "@/models/expense/expense";

export namespace ExpenseAPI {

  export const GetExpenseData =  async (category_id: number) => {
    try {
      const response = await AxiosInstance.get(
        `/expenses/filter-by-category/${category_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          }
        }
      );
      console.log("API Response:", response.data);
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

    export const AddExpense = async (AddFee: AddExpenseModel ) => {
        try {
          const response = await AxiosInstance.post<AddExpenseModel>(
            "/expenses/add_expense/",
            JSON.stringify(AddFee),
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
    export const AddExpenseCat = async (AddExpenseCat: ExpenseCategory ) => {
        try {
          const response = await AxiosInstance.post<AddExpenseModel>(
            "/expense_cat_names/add_expense_cat_name/",
            JSON.stringify(AddExpenseCat),
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

      export const GetExpenseCategory =  async () => {
        try {
          const response = await AxiosInstance.get(
            "/auth/expense_cat_names/expense-cat-names-all/",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              }
            }
          );
          console.log("API Response:", response.data);
          return response;
        } catch (error) {
          console.error("API Error:", error);
          throw error;
        }
      }
}