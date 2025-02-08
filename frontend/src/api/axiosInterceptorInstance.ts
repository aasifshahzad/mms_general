import axios from "axios";

const url = process.env.NEXT_PUBLIC_API_BASE_URL;
// console.log(url);

const AxiosInterceptorInstance = axios.create({
  baseURL: url,
  headers: {
    Accept: "application/json; ; charset=utf-8",
    "Content-Type": "application/json; charset=utf-8",
  },
});

export default AxiosInterceptorInstance;

