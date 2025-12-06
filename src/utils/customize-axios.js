import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For React Native, use environment variables from app.json or constants
const baseURL = 'https://api.yourdomain.com'; // TODO: Update this with your actual API URL

const instance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
});

const NO_RETRY_HEADER = 'x-no-retry';

// Add a request interceptor
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        delete config.headers['Authorization'];
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
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
      // Handle token refresh here if needed
      // For now, just clear token and navigate to login
      try {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        // Navigation will be handled by navigation service
      } catch (e) {
        console.error('Error clearing tokens:', e);
      }
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return error?.response?.data ?? Promise.reject(error);
  }
);

export default instance;
