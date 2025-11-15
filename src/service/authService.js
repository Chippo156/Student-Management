import axios from '../until/customize-axios';
import { message } from 'antd';

export const authService = {
  login: async (data) => {
    const response = await axios.post('/api/v1/Auth/login', data);
    if (!response.success) {
      message.error(response.message || 'Đăng nhập thất bại');
      throw new Error(response.message || 'Login failed');
    }
    return response;
  },

  register: async (data) => {
    const response = await axios.post('/api/v1/Auth/register', data);
    if (!response.success) {
      message.error(response.message || 'Đăng ký thất bại');
      throw new Error(response.message || 'Registration failed');
    }
    return response;
  },

  logout: async () => {
    const response = await axios.post('/api/v1/Auth/logout');
    if (!response.success) {
      message.error(response.message || 'Đăng xuất thất bại');
      throw new Error(response.message || 'Logout failed');
    }
    return response.data;
  },

  refreshToken: async (data) => {
    const response = await axios.post('/api/v1/Auth/refresh-token', data);
    if (!response.success) {
      message.error(response.message || 'Làm mới token thất bại');
      throw new Error(response.message || 'Token refresh failed');
    }
    return response;
  },

  changePassword: async (data) => {
    const response = await axios.post('/api/v1/Auth/change-password', data);
    if (!response.success) {
      message.error(response.message || 'Đổi mật khẩu thất bại');
      throw new Error(response.message || 'Change password failed');
    }
    return response.data;
  },

  introspect: async (token) => {
    const response = await axios.post('/api/v1/Auth/introspect', { token });
    if (!response.success) {
      message.error(response.message || 'Kiểm tra token thất bại');
      throw new Error(response.message || 'Token introspection failed');
    }
    return response.data;
  },

  getUserProfile: async () => {
    const response = await axios.get('/api/v1/Auth/profile');
    if (!response.success) {
      message.error(response.message || 'Lấy thông tin thất bại');
      throw new Error(response.message || 'Get user profile failed');
    }
    return response.data;
  },

  updateUserProfile: async (data) => {
    const response = await axios.put('/api/v1/Auth/profile', data);
    if (!response.success) {
      message.error(response.message || 'Cập nhật thông tin thất bại');
      throw new Error(response.message || 'Update user profile failed');
    }
    return response.data;
  },

  forgotPasswordByMSSV: async (mssv) => {
    try {
      const response = await axios.post('/api/v1/Auth/ForgotPasswordByMSSV', {
        mssv,
      });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Gửi yêu cầu quên mật khẩu thất bại');
        }
        return null;
      }
      message.success('Mật khẩu mới đã được gửi đến email của bạn!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Gửi yêu cầu quên mật khẩu thất bại'
          );
        }
      } else {
        message.error(error.message || 'Gửi yêu cầu quên mật khẩu thất bại');
      }
      return null;
    }
  },
};
