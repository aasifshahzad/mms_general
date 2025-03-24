import axiosIntance from "@/api/axiosInterceptorInstance";

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: any;
}

export namespace LoginAPI {
  export async function Create(loginData: LoginData) {
    try {
      const response = await axiosIntance.post<LoginResponse >(
        "/auth/frontend/login",
        JSON.stringify(loginData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error during login API call:", error);
      throw error;
    }
  }
}
