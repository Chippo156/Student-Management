import { message } from 'antd';
import axios from '../until/customize-axios';

export const userService = {
  getUserInfo: async () => {
    try {
      const response = await axios.get('/api/v1/Auth/GetCurrentUserByToken');
      if (!response.success) {
        message.error(response.message || 'Lấy thông tin người dùng thất bại');
        throw new Error(response.message || 'Get user info failed');
      }
      return response.data;
    } catch (error) {
      message.error(
        error.response?.data?.message || error.message || 'Get user info failed'
      );
      throw new Error(
        error.response?.data?.message || error.message || 'Get user info failed'
      );
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`/api/v1/User/${userId}`, userData);
      if (!response.success) {
        message.error(response.message || 'Cập nhật người dùng thất bại');
        throw new Error(response.message || 'Update user failed');
      }
      return response.data;
    } catch (error) {
      message.error(
        error.response?.data?.message || error.message || 'Update user failed'
      );
      throw new Error(
        error.response?.data?.message || error.message || 'Update user failed'
      );
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/v1/User/${userId}`);
      if (!response.success) {
        message.error(response.message || 'Xóa người dùng thất bại');
        throw new Error(response.message || 'Delete user failed');
      }
      return response.data;
    } catch (error) {
      message.error(
        error.response?.data?.message || error.message || 'Delete user failed'
      );
      throw new Error(
        error.response?.data?.message || error.message || 'Delete user failed'
      );
    }
  },

  changeUserStatus: async (userId, status) => {
    try {
      const response = await axios.patch(`/api/v1/User/${userId}/status`, {
        status,
      });
      if (!response.success) {
        message.error(response.message || 'Đổi trạng thái người dùng thất bại');
        throw new Error(response.message || 'Change user status failed');
      }
      return response.data;
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          'Change user status failed'
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Change user status failed'
      );
    }
  },
};
