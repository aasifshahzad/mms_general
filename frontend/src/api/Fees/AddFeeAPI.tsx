import AxiosInstance from "@/api/axiosInterceptorInstance";
import {AddFeeModel} from "@/models/Fees/Fee";

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

  // New API for class fee status
  GetClassFeeStatus: async ({
    class_id,
    fee_month,
    fee_year,
  }: {
    class_id: number | string;
    fee_month: string;
    fee_year: string | number;
  }) => {
    try {
      const response = await AxiosInstance.get(
        `/fee/class-fee-status/${class_id}?fee_month=${fee_month}&fee_year=${fee_year}`,
        {
          headers: getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

// For backward compatibility, also export individual functions
export const { Create, GetClassFeeStatus } = FeeAPI;