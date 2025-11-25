import axios from '../until/customize-axios';
import { message } from 'antd';

export const classService = {
  // Lấy danh sách tất cả lớp học
  getAllClasses: async (pageNumber, pageSize, search = '', programId = null) => {
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      if (programId) {
        params.programId = programId;
      }

      const response = await axios.get('/api/Class/GetAllClasses', { params });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách lớp thất bại'
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
            error.response.data.message || 'Lấy danh sách lớp thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách lớp thất bại');
      }
      return null;
    }
  },

  // Tạo lớp học mới
  createClass: async (classData) => {
    try {
      const response = await axios.post('/api/Class/CreateClass', classData);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo lớp học thất bại');
        }
        return null;
      }
      message.success('Tạo lớp học thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Tạo lớp học thất bại'
          );
        }
      } else {
        message.error(error.message || 'Tạo lớp học thất bại');
      }
      return null;
    }
  },

  // Cập nhật lớp học
  updateClass: async (classId, classData) => {
    try {
      const response = await axios.put(
        `/api/Class/UpdateClasses/${classId}`,
        classData
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Cập nhật lớp học thất bại'
          );
        }
        return null;
      }
      message.success('Cập nhật lớp học thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Cập nhật lớp học thất bại'
          );
        }
      } else {
        message.error(error.message || 'Cập nhật lớp học thất bại');
      }
      return null;
    }
  },

  // Xóa lớp học
  deleteClass: async (classId) => {
    try {
      const response = await axios.delete(`/api/Class/DeleteClass/${classId}`);
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Xóa lớp học thất bại');
        }
        return null;
      }
      message.success('Xóa lớp học thành công!');
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Xóa lớp học thất bại'
          );
        }
      } else {
        message.error(error.message || 'Xóa lớp học thất bại');
      }
      return null;
    }
  },

  // Lấy danh sách lớp theo chuyên ngành cho dropdown
  getClassesDropdownByDepartment: async (departmentId) => {
    try {
      const response = await axios.get(
        `/api/Class/dropdown/department/${departmentId}`
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách lớp thất bại'
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
            error.response.data.message || 'Lấy danh sách lớp thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách lớp thất bại');
      }
      return null;
    }
  },

  // Lấy danh sách lớp theo chương trình cho dropdown
  getClassesDropdownByProgram: async (programId) => {
    try {
      const response = await axios.get(
        `/api/Class/dropdown/program/${programId}`
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách lớp thất bại'
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
            error.response.data.message || 'Lấy danh sách lớp thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách lớp thất bại');
      }
      return null;
    }
  },
};
