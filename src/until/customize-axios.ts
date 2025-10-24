import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

const baseURL =
  ((import.meta as any).env?.VITE_APP_BE_API_URL as string) ||
  "https://localhost:7061";

const instance: AxiosInstance = axios.create({
  baseURL,
});

// Request Interceptor (như cũ)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — unwrap .data
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // ✅ Trả về thẳng data theo format của BE
    return response.data;
  },
  async (error: AxiosError) => {
    return error.response?.data ?? Promise.reject(error);
  }
);

// ✅ Đây là điểm quan trọng
// Gói axios instance lại thành một object có generic type-safe
const api = {
  get: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const res = (await instance.get<ApiResponse<T>>(url, config)) as unknown as ApiResponse<T>;
    return res; // vì interceptor đã unwrap
  },
  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const res = (await instance.post<ApiResponse<T>>(url, data, config)) as unknown as ApiResponse<T>;
    return res; // cũng là ApiResponse<T>
  },
  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const res = (await instance.put<ApiResponse<T>>(url, data, config)) as unknown as ApiResponse<T>;
    return res;
  },
  delete: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const res = (await instance.delete<ApiResponse<T>>(url, config)) as unknown as ApiResponse<T>;
    return res;
  },
};

export default api;
