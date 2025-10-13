import axios from "axios"
const baseURL =
  import.meta.env.VITE_APP_BE_API_URL || "https://localhost:7061";

const instance= axios.create({
  baseURL: baseURL,
  // withCredentials: true,
});

const NO_RETRY_HEADER = "x-no-retry";

const handleRefreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    const userDataStr = localStorage.getItem("user_data");
    
    if (!refreshToken || !userDataStr) {
      return null;
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.userId;

    const res = await instance.post("/api/v1/Auth/refresh-token", {
      userId: userId,
      refreshToken: refreshToken
    });

    if (res && res.data && res.data.success) {
      const newAccessToken = res.data.data.accessToken;
      const newRefreshToken = res.data.data.refreshToken;
      
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

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Only attach Authorization for non-public routes
    const publicPaths = ["/api/v1/Auth/login", "/api/v1/Auth/register", "/api/v1/Auth/forgot-password", "/api/v1/Auth/refresh-token"];
    const isPublic = publicPaths.some((path) => config.url?.includes(path));
    const token = localStorage.getItem("access_token");
    if (!isPublic && token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data ? response.data : response;
  },
  async function (error) {
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
        // Refresh token failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      }
    }
    
    if (
      error.config &&
      error.response &&
      error.response.status === 400 &&
      error.config.url === "/api/v1/Auth/refresh-token"
    ) {
      // Refresh token is invalid, redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    }
    
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return error?.response?.data ?? Promise.reject(error);
  }
);

export default instance;