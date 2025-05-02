import AxiosInstance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";
import { AddIncomeModel, CreateIncomeCat } from "@/models/income/income";

export namespace IncomeAPI {

  export const GetIncomeData =  async (category_id: number) => {
    try {
      const response = await AxiosInstance.get(
        `/income/filter_income?category_id=${category_id}`,
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

    export const AddIncome = async (AddFee: AddIncomeModel ) => {
        try {
          const response = await AxiosInstance.post<AddIncomeModel>(
            "/income/",
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

      export const GetIncomeCategory =  async () => {
        try {
          const response = await AxiosInstance.get(
            "/auth/income_cat_names/income-cat-names-all/",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              }
            }
          );
          // console.log("API Response:", response.data);
          return response;
        } catch (error) {
          console.error("API Error:", error);
          throw error;
        }
      }

      export const AddIncomeCategory  = async (AddIncomeCat: CreateIncomeCat) => {
        try {
          const response = await AxiosInstance.post<CreateIncomeCat>(
            "/income_cat_names/add_income_cat_name/",
            JSON.stringify(AddIncomeCat),
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
}