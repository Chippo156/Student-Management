import { message } from 'antd';
import axios from '../until/customize-axios';

export const userService = {
  getUserInfo: async () => {
    const response = await axios.get('/api/Student/byToken');
    if (!response.success) {
      message.error(response.message || 'Lấy thông tin người dùng thất bại');
      throw new Error(response.message || 'Get user info failed');
    }
    return response.data;
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`/api/v1/User/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Update user failed');
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/v1/User/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Delete user failed');
    }
  },

  changeUserStatus: async (userId, status) => {
    try {
      const response = await axios.patch(`/api/v1/User/${userId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Change user status failed'
      );
    }
  },
};
