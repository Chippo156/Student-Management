import customizeAxios from '../until/customize-axios';
import { message } from 'antd';

export const studentServices = {
  updateStudentInformation: async (data) => {
    try {
      const res = await customizeAxios.put(
        `/api/Student/UpdateStudentInformation`,
        data
      );
      if (res?.success === false) {
        message.error(res?.message || 'Cập nhật thông tin người dùng thất bại');
        throw new Error(
          res?.message || 'Cập nhật thông tin người dùng thất bại'
        );
      }
      return res.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message ||
              'Cập nhật thông tin người dùng thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Cập nhật thông tin người dùng thất bại'
        );
      }
      return null;
    }
  },

  getAllStudents: async (pageNumber, pageSize, search = '', filters = {}) => {
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      // Add filter parameters
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.className) params.className = filters.className;
      if (filters.yearOfAdmission) params.yearOfAdmission = filters.yearOfAdmission;
      if (filters.studentStatus !== undefined && filters.studentStatus !== '') {
        params.studentStatus = filters.studentStatus;
      }

      const response = await customizeAxios.get('/api/Student/GetAllStudents', {
        params,
      });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách sinh viên thất bại'
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
            error.response.data.message || 'Lấy danh sách sinh viên thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách sinh viên thất bại');
      }
      return null;
    }
  },
  // New: get students with section (paged, searchable)
  getStudentsWithSection: async (
    sectionId,
    pageNumber = 1,
    pageSize = 10,
    searchTerm = ''
  ) => {
    try {
      const response = await customizeAxios.get(
        `/api/Student/GetStudentsWithSection/${sectionId}`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            searchTerm,
          },
        }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message ||
              'Lấy danh sách sinh viên theo lớp học phần thất bại'
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
              'Lấy danh sách sinh viên theo lớp học phần thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Lấy danh sách sinh viên theo lớp học phần thất bại'
        );
      }
      return null;
    }
  },
};
