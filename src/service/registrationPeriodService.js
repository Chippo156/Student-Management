import axios from '../until/customize-axios';
import { message } from 'antd';

const registrationPeriodService = {
  // Get all registration periods
  getAllRegistrationPeriods: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        departmentId = null,
        semesterId = null,
        isActive = null,
      } = params;

      const queryParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (departmentId) queryParams.DepartmentId = departmentId;
      if (semesterId) queryParams.SemesterId = semesterId;
      if (isActive !== null && isActive !== '') queryParams.IsActive = isActive;

      const response = await axios.get('/api/RegistrationPeriod', {
        params: queryParams,
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách khung thời gian đăng ký thất bại'
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
            error.response.data.message ||
              'Lấy danh sách khung thời gian đăng ký thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Lấy danh sách khung thời gian đăng ký thất bại'
        );
      }
      return null;
    }
  },

  // Create registration period
  createRegistrationPeriod: async (data) => {
    try {
      const response = await axios.post('/api/RegistrationPeriod', data);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Tạo khung thời gian đăng ký thất bại'
          );
        }
        return null;
      }

      message.success('Tạo khung thời gian đăng ký thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Tạo khung thời gian đăng ký thất bại'
          );
        }
      } else {
        message.error(error.message || 'Tạo khung thời gian đăng ký thất bại');
      }
      return null;
    }
  },

  // Update registration period
  updateRegistrationPeriod: async (id, data) => {
    try {
      const response = await axios.put(`/api/RegistrationPeriod/${id}`, data);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Cập nhật khung thời gian đăng ký thất bại'
          );
        }
        return null;
      }

      message.success('Cập nhật khung thời gian đăng ký thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message ||
              'Cập nhật khung thời gian đăng ký thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Cập nhật khung thời gian đăng ký thất bại'
        );
      }
      return null;
    }
  },

  // Delete registration period
  deleteRegistrationPeriod: async (id) => {
    try {
      const response = await axios.delete(`/api/RegistrationPeriod/${id}`);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Xóa khung thời gian đăng ký thất bại'
          );
        }
        return null;
      }

      message.success('Xóa khung thời gian đăng ký thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Xóa khung thời gian đăng ký thất bại'
          );
        }
      } else {
        message.error(error.message || 'Xóa khung thời gian đăng ký thất bại');
      }
      return null;
    }
  },
};

export default registrationPeriodService;
