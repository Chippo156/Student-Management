import axios from '../until/customize-axios';
import { message } from 'antd';

const statisticsService = {
  /**
   * Lấy thống kê tổng quan hệ thống
   */
  getOverview: async () => {
    try {
      console.log('🔍 Calling API: /api/v1/Statistics/overview');
      const response = await axios.get('/api/v1/Statistics/overview');
      console.log('✅ Overview API response:', response);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy thống kê tổng quan thất bại');
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Overview API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy thống kê tổng quan thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy thống kê tổng quan thất bại');
      }
      return null;
    }
  },

  /**
   * Thống kê sinh viên theo trạng thái
   */
  getStudentStatus: async () => {
    try {
      console.log(
        '🔍 Calling API: /api/v1/Statistics/statistics/student-status'
      );
      const response = await axios.get(
        '/api/v1/Statistics/statistics/student-status'
      );
      console.log('✅ Student status API response:', response);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thống kê trạng thái sinh viên thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Student status API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message ||
              'Lấy thống kê trạng thái sinh viên thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Lấy thống kê trạng thái sinh viên thất bại'
        );
      }
      return null;
    }
  },

  /**
   * Thống kê tăng trưởng hàng năm
   * @param {number} years - Số năm gần nhất (default: 7)
   */
  getYearlyGrowth: async (years = 7) => {
    try {
      console.log(
        `🔍 Calling API: /api/v1/Statistics/Yearly-growth?years=${years}`
      );
      const response = await axios.get('/api/v1/Statistics/Yearly-growth', {
        params: { years },
      });
      console.log('✅ Yearly growth API response:', response);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thống kê tăng trưởng thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Yearly growth API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy thống kê tăng trưởng thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy thống kê tăng trưởng thất bại');
      }
      return null;
    }
  },

  /**
   * Thống kê tốt nghiệp hàng năm
   */
  getGraduationYearly: async () => {
    try {
      console.log('🔍 Calling API: /api/v1/Statistics/graduation-yearly');
      const response = await axios.get('/api/v1/Statistics/graduation-yearly');
      console.log('✅ Graduation API response:', response);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thống kê tốt nghiệp thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Graduation API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy thống kê tốt nghiệp thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy thống kê tốt nghiệp thất bại');
      }
      return null;
    }
  },

  // ✅ API MỚI 1: Thống kê sinh viên theo năm học
  /**
   * Thống kê sinh viên theo năm học (Năm 1, 2, 3, 4, 5+)
   */
  getStudentsByYear: async () => {
    try {
      console.log('🔍 Calling API: /api/v1/Statistics/students-by-year');
      const response = await axios.get('/api/v1/Statistics/students-by-year');
      console.log('✅ Students by year API response:', response);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thống kê sinh viên theo năm học thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Students by year API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message ||
              'Lấy thống kê sinh viên theo năm học thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Lấy thống kê sinh viên theo năm học thất bại'
        );
      }
      return null;
    }
  },

  // ✅ API MỚI 2: Thống kê sinh viên theo chuyên ngành
  /**
   * Thống kê sinh viên theo chuyên ngành
   */
  getStudentsByDepartment: async () => {
    try {
      console.log('🔍 Calling API: /api/v1/Statistics/students-by-department');
      const response = await axios.get(
        '/api/v1/Statistics/students-by-department'
      );
      console.log('✅ Students by department API response:', response);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message ||
              'Lấy thống kê sinh viên theo chuyên ngành thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Students by department API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message ||
              'Lấy thống kê sinh viên theo chuyên ngành thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Lấy thống kê sinh viên theo chuyên ngành thất bại'
        );
      }
      return null;
    }
  },

  /**
   * Lấy thống kê điểm của một sinh viên theo MSSV
   */
  getStudentGrades: async (mssv) => {
    try {
      const response = await axios.get(
        `/api/v1/Statistics/student-grades/${mssv}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thống kê điểm sinh viên thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Student grades API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message ||
              'Lấy thống kê điểm sinh viên thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy thống kê điểm sinh viên thất bại');
      }
      return null;
    }
  },

  /**
   * Lấy thống kê điểm của tất cả sinh viên
   */
  getAllStudentsGrades: async (params = {}) => {
    try {
      const response = await axios.get(
        '/api/v1/Statistics/all-students-grades',
        {
          params,
        }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thống kê điểm tất cả sinh viên thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('❌ All students grades API error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message ||
              'Lấy thống kê điểm tất cả sinh viên thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Lấy thống kê điểm tất cả sinh viên thất bại'
        );
      }
      return null;
    }
  },
};

export default statisticsService;
