import { toast } from '../utils/toast';
import axios from '../utils/customize-axios';

export const userService = {
  resetPassword: async (data) => {
    try {
      const response = await axios.put('/api/User/ResetPassword', data);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Đổi mật khẩu thất bại');
        }
        return null;
      }

      toast.success('Đổi mật khẩu thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Đổi mật khẩu thất bại');
        }
      } else {
        toast.error(error.message || 'Đổi mật khẩu thất bại');
      }
      return null;
    }
  },
  getUserInfo: async () => {
    try {
      const response = await axios.get('/api/v1/Auth/GetCurrentUserByToken');
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Lấy thông tin người dùng thất bại'
          );
        }
        return null;
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Get user info failed');
        }
      } else {
        toast.error(error.message || 'Get user info failed');
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
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Cập nhật người dùng thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Update user failed');
        }
      } else {
        toast.error(error.message || 'Update user failed');
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
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Xóa người dùng thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Delete user failed');
        }
      } else {
        toast.error(error.message || 'Delete user failed');
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
          toast.error(errData[0]);
        } else {
          toast.error(
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
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Change user status failed'
          );
        }
      } else {
        toast.error(error.message || 'Change user status failed');
      }
      return null;
    }
  },

  getAllUsers: async (
    pageNumber = 1,
    pageSize = 10,
    roleId = null,
    search = ''
  ) => {
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (roleId !== null && roleId !== undefined && roleId !== '') {
        params.roleId = roleId;
      }

      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      const response = await axios.get('/api/User/GetAllUsers', { params });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
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
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Get all users failed');
        }
      } else {
        toast.error(error.message || 'Get all users failed');
      }
      return null;
    }
  },
  createUserWithRole: async (userData) => {
    try {
      const response = await axios.post('/api/User/create-with-role', userData);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Tạo người dùng thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Create user failed');
        }
      } else {
        toast.error(error.message || 'Create user failed');
      }
      return null;
    }
  },

  deactivateUser: async (userId) => {
    try {
      const response = await axios.put(`/api/User/deactivate/${userId}`);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Vô hiệu hóa người dùng thất bại');
        }
        return null;
      }
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Deactivate user failed'
          );
        }
      } else {
        toast.error(error.message || 'Deactivate user failed');
      }
      return null;
    }
  },

  reactivateUser: async (userId) => {
    try {
      const response = await axios.put(`/api/User/reactivate/${userId}`);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Kích hoạt lại người dùng thất bại'
          );
        }
        return null;
      }
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Reactivate user failed'
          );
        }
      } else {
        toast.error(error.message || 'Reactivate user failed');
      }
      return null;
    }
  },
  updateUserWithRole: async (userId, userData) => {
    try {
      const response = await axios.put(
        `/api/User/update-with-role/${userId}`,
        userData
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Cập nhật người dùng thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Update user failed');
        }
      } else {
        toast.error(error.message || 'Update user failed');
      }
      return null;
    }
  },
};
