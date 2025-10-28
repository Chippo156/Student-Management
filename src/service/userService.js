import { message } from 'antd';
import axios from '../until/customize-axios';

export const userService = {
  getUserInfo: async () => {
    try {
      const response = await axios.get('/api/v1/Auth/GetCurrentUserByToken');
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thông tin người dùng thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Get user info failed');
        }
      } else {
        message.error(error.message || 'Get user info failed');
      }
      return null;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`/api/v1/User/${userId}`, userData);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Cập nhật người dùng thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Update user failed');
        }
      } else {
        message.error(error.message || 'Update user failed');
      }
      return null;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/v1/User/${userId}`);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Xóa người dùng thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Delete user failed');
        }
      } else {
        message.error(error.message || 'Delete user failed');
      }
      return null;
    }
  },

  changeUserStatus: async (userId, status) => {
    try {
      const response = await axios.patch(`/api/v1/User/${userId}/status`, {
        status,
      });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Đổi trạng thái người dùng thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Change user status failed'
          );
        }
      } else {
        message.error(error.message || 'Change user status failed');
      }
      return null;
    }
  },

  getAllUsers: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axios.get('/api/User/GetAllUsers', {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách người dùng thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Get all users failed');
        }
      } else {
        message.error(error.message || 'Get all users failed');
      }
      return null;
    }
  },
};
