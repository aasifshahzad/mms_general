import AxiosInstance from "@/api/axiosInterceptorInstance";
import {GetActionDetail} from "@/utils/GetActionDetail";
import {AddFeeModel, GetFeeModel} from "@/models/Fees/Fee";

export namespace FeeAPI {
    export const Create = async (AddFee: AddFeeModel) => {
        try {
          const response = await AxiosInstance.post<AddFeeModel>(
            "/fee/add_fee/",
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
    //   export const GetFeebyFilter = async (GetFee: GetFeeModel) => {
    //     try {
    //       const response = await AxiosInstance.post<GetFeeModel>(
    //         `/fee/filter/?student_id=${GetFee.student_id}&class_name_id=${GetFee.class_id}&fee_month=${GetFee.fee_month}&fee_year=${GetFee.fee_year}&fee_status=${GetFee.fee_status}`,
    //         JSON.stringify(GetFee),
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
}