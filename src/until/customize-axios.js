import axios from "axios";
const baseURL =
  import.meta.env.VITE_APP_BE_API_URL || "http://localhost:8080/api/v1";
const instance = axios.create({
  baseURL: baseURL,
  // withCredentials: true,
});

const NO_RETRY_HEADER = "x-no-retry";
// const handleRefeshToken = async () => {
//   let res = await instance.get("/api/v1/auth/refresh");
//   if (res && res.data) {
//     return res.data.access_token;
//   }
//   return null;
// };

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
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
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      // let access_token = await handleRefeshToken();
      // error.config.headers["Authorization"] = `Bearer ${access_token}`;
      // localStorage.setItem("access_token", access_token);
      // error.config.headers[NO_RETRY_HEADER] = "true";
      // return instance.request(error.config);
      // return updateToken().then((token) => {
      //   error.config.headers.xxxx <= set the token
      //   return axios.request(config);
      // });
    }
    // if (
    //   error.config &&
    //   error.response &&
    //   error.response.status === 400 &&
    //   error.config.url === "/api/v1/auth/refresh"
    // ) {
    //   window.location.href = "/login";
    // }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return error?.response?.data ?? Promise.reject(error);
  }
);
export default instance;
