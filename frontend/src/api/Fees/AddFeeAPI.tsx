import AxiosInstance from "@/api/axiosInterceptorInstance";
import {AddFeeModel, GetFeeModel} from "@/models/Fees/Fee";

// Helper function to get standard headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

// Export as a single API object
export const FeeAPI = {
  Create: async (AddFee: AddFeeModel) => {
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
  },
  
  GetFeebyFilter: async (GetFee: GetFeeModel) => {
    try {
      const response = await AxiosInstance.post<GetFeeModel>(
        `/fee/filter/?student_id=${GetFee.student_id}&class_name_id=${GetFee.class_id}&fee_month=${GetFee.fee_month}&fee_year=${GetFee.fee_year}&fee_status=${GetFee.fee_status}`,
        JSON.stringify(GetFee),
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
  }
};

// For backward compatibility, also export individual functions
export const { Create, GetFeebyFilter } = FeeAPI;