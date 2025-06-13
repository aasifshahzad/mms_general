import AxiosInstance from "@/api/axiosInterceptorInstance";
import { AddFeeModel } from "@/models/Fees/Fee";
import { AxiosResponse } from "axios";

// Helper function to get standard headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

// Export as a single API object
export const FeeAPI = {
  Create: async (AddFee: AddFeeModel): Promise<AxiosResponse<AddFeeModel>> => {
    try {
      const response = await AxiosInstance.post(
        "/fee/add_fee/",
        JSON.stringify(AddFee),
        { headers: getHeaders() }
      );
      console.log("API Response:", response);
      return response;
    } catch (error: unknown) {
      console.error("API Error:", error);
      throw error;
    }
  },
  GetClassFeeStatus: async (
    classId: number,
    feeMonth: string,
    feeYear: number
  ): Promise<AxiosResponse<any>> => {
    try {
      const response = await AxiosInstance.get(
        `/fee/class-fee-status/${classId}?fee_month=${feeMonth}&fee_year=${feeYear}`,
        { headers: getHeaders() }
      );
      console.log("API Response:", response);
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

// For backward compatibility, also export individual functions
export const { Create, GetClassFeeStatus } = FeeAPI;