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

  // Đổi mật khẩu
  resetPassword: async (passwordData) => {
    try {
      const response = await customizeAxios.put('/api/User/ResetPassword', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Reset password failed'
      );
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

  // Create new student
  createStudent: async (studentData) => {
    try {
      const response = await customizeAxios.post(
        '/api/Student/CreateStudent',
        studentData
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo sinh viên thất bại');
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
            error.response.data.message || 'Tạo sinh viên thất bại'
          );
        }
      } else {
        message.error(error.message || 'Tạo sinh viên thất bại');
      }
      return null;
    }
  },

  // Update student
  updateStudent: async (studentData) => {
    try {
      const response = await customizeAxios.put(
        '/api/Student/UpdateStudent',
        studentData
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Cập nhật sinh viên thất bại');
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
            error.response.data.message || 'Cập nhật sinh viên thất bại'
          );
        }
      } else {
        message.error(error.message || 'Cập nhật sinh viên thất bại');
      }
      return null;
    }
  },

  // Lấy danh sách phiên điểm danh khả dụng cho sinh viên tự điểm danh
  getAvailableCheckInSessions: async () => {
    try {
      const response = await customizeAxios.get(
        '/api/student/attendance/available-sessions'
      );
      if (response?.success === false) {
        message.error(
          response?.message || 'Lấy danh sách phiên điểm danh thất bại'
        );
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching available sessions:', error);
      message.error('Lấy danh sách phiên điểm danh thất bại');
      return null;
    }
  },

  // Sinh viên tự điểm danh
  selfCheckIn: async (attendanceSessionId, checkInCode = '', note = null) => {
    try {
      const response = await customizeAxios.post(
        '/api/student/attendance/check-in',
        {
          attendanceSessionId,
          checkInCode,
          note,
        }
      );
      if (response?.success === false) {
        message.error(response?.message || 'Điểm danh thất bại');
        return null;
      }
      message.success('Điểm danh thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data;
        if (Array.isArray(errData.data) && errData.data.length > 0) {
          message.error(errData.data[0]);
        } else {
          message.error(errData.message || 'Điểm danh thất bại');
        }
      } else {
        message.error(error.message || 'Điểm danh thất bại');
      }
      return null;
    }
  },

  // Lấy lịch sử điểm danh
  getCheckInHistory: async () => {
    try {
      const response = await customizeAxios.get(
        '/api/student/attendance/GetAllCheckIn'
      );
      if (response?.success === false) {
        message.error(
          response?.message || 'Lấy lịch sử điểm danh thất bại'
        );
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching check-in history:', error);
      message.error('Lấy lịch sử điểm danh thất bại');
      return null;
    }
  },
};
