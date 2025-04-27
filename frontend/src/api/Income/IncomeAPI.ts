import AxiosInstance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";
import { IncomeCategory } from "@/models/income/income";

export namespace IncomeAPI {
    // export const Create = async (AddFee: AddFeeModel) => {
    //     try {
    //       const response = await AxiosInstance.post<AddFeeModel>(
    //         "/fee/add_fee/",
    //         JSON.stringify(AddFee),
    //         {
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    //           },
    //         }
    //       );
    //       console.log("API Response:", response);
    //       return response;
    //     } catch (error) {
    //       console.error("API Error:", error);
    //       throw error; 
    //     }
    //   };
      export const GetIncomeCategory =  async (): Promise<IncomeCategory[]> => {
        try {
          const response = await AxiosInstance.post<{ data: IncomeCategory[] }>(
            "auth/income_cat_names/income-cat-names-all/",
            {}, // No need for JSON.stringify({})
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              }
            }
          );
          console.log("API Response:", response.data);
          return response.data.data;
        } catch (error) {
          console.error("API Error:", error);
          throw error;
        }
      }
}