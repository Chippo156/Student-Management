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
  updateStudentInformation: async (data) => {
    try {
      const response = await axios.put(
        '/api/Student/UpdateStudentInformation',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update student information failed'
      );
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await axios.put('/api/v1/User/profile', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Update profile failed');
    }
  },

  changePassword: async (data) => {
    try {
      const response = await axios.post('/api/v1/User/change-password', data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Change password failed'
      );
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axios.post(
        '/api/v1/User/upload-avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload avatar failed');
    }
  },

  getAllUsers: async (params) => {
    try {
      const response = await axios.get('/api/v1/User/all', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Get all users failed');
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axios.get(`/api/v1/User/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Get user by ID failed');
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post('/api/v1/User/create', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Create user failed');
    }
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
