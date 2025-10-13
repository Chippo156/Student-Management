import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const baseURL: string =
  import.meta.env.VITE_APP_BE_API_URL || "https://localhost:7061";

const instance: AxiosInstance = axios.create({
  baseURL: baseURL,
  // withCredentials: true,
});

const NO_RETRY_HEADER = "x-no-retry";

// ============================
// Define API response structure
// ============================
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// ============================
// Handle Refresh Token
// ============================
const handleRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    const userDataStr = localStorage.getItem("user_data");
    
    if (!refreshToken || !userDataStr) {
      return null;
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.userId;

    const res = await instance.post<ApiResponse<{
      token: { accessToken: string; refreshToken: string };
      user: any;
    }>>("/api/v1/Auth/refresh-token", {
      userId: userId,
      refreshToken: refreshToken
    });

    if (res && res.success) {
      const newAccessToken = res.data.token.accessToken;
      const newRefreshToken = res.data.token.refreshToken;

      // Update localStorage with new tokens
      localStorage.setItem("access_token", newAccessToken);
      localStorage.setItem("refresh_token", newRefreshToken);

      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error("Refresh token failed:", error);
    return null;
  }
};

// ============================
// Request Interceptor
// ============================
instance.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const publicPaths = [
      "/api/v1/Auth/login",
      "/api/v1/Auth/register",
      "/api/v1/Auth/forgot-password",
      "/api/v1/Auth/refresh-token"
    ];

    const isPublic = publicPaths.some((path) => config.url?.includes(path));
    const token = localStorage.getItem("access_token");

    if (!isPublic && token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers["Authorization"];
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// ============================
// Response Interceptor
// ============================
instance.interceptors.response.use(
  function (response: AxiosResponse): any {
    return response.data;
  },
  async function (error: AxiosError): Promise<any> {
    // Chỉ tự reload khi đang gọi refresh-token hoặc khi đã đăng nhập rồi
    const isAuthApi =
      error.config?.url?.includes("/api/v1/Auth/refresh-token") ||
      error.config?.url?.includes("/api/v1/Auth/profile");

    // Nếu là lỗi login (POST /api/v1/Auth/login) thì trả về lỗi cho UI
    if (
      error.config &&
      error.config.url?.includes("/api/v1/Auth/login") &&
      error.response &&
      (error.response.status === 401 || error.response.status === 400)
    ) {
      // Trả về dữ liệu lỗi cho UI xử lý
      return error?.response?.data ?? Promise.reject(error);
    }

    // Trường hợp 401 → tự động refresh token
    if (
      error.config &&
      error.response &&
      error.response.status === 401 &&
      error.config.headers &&
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      const access_token = await handleRefreshToken();

      if (access_token) {
        error.config.headers["Authorization"] = `Bearer ${access_token}`;
        error.config.headers[NO_RETRY_HEADER] = "true";
        return instance.request(error.config);
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    // Trường hợp refresh token không hợp lệ (400)
    if (
      error.config &&
      error.response &&
      error.response.status === 400 &&
      error.config.url === "/api/v1/Auth/refresh-token"
    ) {
      localStorage.clear();
      window.location.href = "/login";
    }

    // Trả về dữ liệu lỗi từ BE nếu có
    return error?.response?.data ?? Promise.reject(error);
  }
);

export default instance;
