import axios from "axios";

// Security: Tokens are now in HTTPOnly cookies, not localStorage
// This interceptor no longer manages tokens directly

const axiosInterceptorInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,  // Security: Include HTTPOnly cookies in requests
});

// Request interceptor
axiosInterceptorInstance.interceptors.request.use(
  (config) => {
    // No need to manually add token - it's in the HTTPOnly cookie
    // and sent automatically via withCredentials
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and refresh token
axiosInterceptorInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token endpoint - tokens in cookies
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }  // Include cookies
        );

        // After refresh, retry original request
        // New access token is now in HTTPOnly cookie
        return axiosInterceptorInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear authentication and redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInterceptorInstance;

