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

      // Axios interceptor đã return response.data, nên response chính là object {success, code, message, data}
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

  // ============ MOCK APIs (TODO: Replace with real APIs) ============

  /**
   * [MOCK] Thống kê sinh viên theo năm học
   * TODO: Replace with real API when available
   */
  getStudentsByYear: async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Mock data - students by academic year
      return [
        { year: 'Năm 1', count: 892, percentage: 30.1, color: '#1976d2' },
        { year: 'Năm 2', count: 756, percentage: 25.5, color: '#2e7d32' },
        { year: 'Năm 3', count: 634, percentage: 21.4, color: '#ed6c02' },
        { year: 'Năm 4', count: 521, percentage: 17.6, color: '#9c27b0' },
        { year: 'Năm 5+', count: 160, percentage: 5.4, color: '#d32f2f' },
      ];
    } catch (error) {
      console.error('❌ Mock students by year error:', error);
      return null;
    }
  },

  /**
   * [MOCK] Thống kê sinh viên theo khoa/chuyên ngành
   * TODO: Replace with real API when available
   */
  getDepartmentDistribution: async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Mock data representing student distribution across departments
      return [
        {
          departmentName: 'Công nghệ Phần mềm',
          studentCount: 845,
          percentage: 28.5,
          color: '#1976d2',
        },
        {
          departmentName: 'Hệ thống Thông tin',
          studentCount: 632,
          percentage: 21.3,
          color: '#2e7d32',
        },
        {
          departmentName: 'Khoa học Máy tính',
          studentCount: 589,
          percentage: 19.9,
          color: '#ed6c02',
        },
        {
          departmentName: 'An toàn Thông tin',
          studentCount: 456,
          percentage: 15.4,
          color: '#9c27b0',
        },
        {
          departmentName: 'Mạng & Truyền thông',
          studentCount: 441,
          percentage: 14.9,
          color: '#d32f2f',
        },
      ];
    } catch (error) {
      console.error('❌ Mock department distribution error:', error);
      return null;
    }
  },

  /**
   * [MOCK] Thống kê điểm trung bình theo khoa
   * TODO: Replace with real API when available
   */
  getGPAByDepartment: async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      return [
        {
          id: 1,
          departmentName: 'Công nghệ Phần mềm',
          averageGPA: 3.15,
          excellentCount: 145,
          goodCount: 423,
          averageCount: 234,
          weakCount: 43,
        },
        {
          id: 2,
          departmentName: 'Hệ thống Thông tin',
          averageGPA: 3.08,
          excellentCount: 112,
          goodCount: 356,
          averageCount: 142,
          weakCount: 22,
        },
        {
          id: 3,
          departmentName: 'Khoa học Máy tính',
          averageGPA: 3.22,
          excellentCount: 156,
          goodCount: 289,
          averageCount: 123,
          weakCount: 21,
        },
        {
          id: 4,
          departmentName: 'An toàn Thông tin',
          averageGPA: 3.18,
          excellentCount: 98,
          goodCount: 245,
          averageCount: 98,
          weakCount: 15,
        },
        {
          id: 5,
          departmentName: 'Mạng & Truyền thông',
          averageGPA: 3.05,
          excellentCount: 89,
          goodCount: 234,
          averageCount: 102,
          weakCount: 16,
        },
      ];
    } catch (error) {
      console.error('❌ Mock GPA by department error:', error);
      return null;
    }
  },

  /**
   * [MOCK] Thống kê học phí
   * TODO: Replace with real API when available
   */
  getTuitionStatistics: async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        totalRevenue: 15600000000, // 15.6 tỷ VNĐ
        paidAmount: 12800000000, // 12.8 tỷ VNĐ
        pendingAmount: 2800000000, // 2.8 tỷ VNĐ
        overdueAmount: 450000000, // 450 triệu VNĐ
        paidPercentage: 82.1,
        pendingPercentage: 17.9,
        overdueCount: 67,
        paidCount: 2156,
        pendingCount: 234,
        monthlyStats: [
          { month: 'T1', paid: 1200, pending: 45, overdue: 12 },
          { month: 'T2', paid: 1150, pending: 38, overdue: 8 },
          { month: 'T3', paid: 1280, pending: 52, overdue: 15 },
          { month: 'T4', paid: 1320, pending: 41, overdue: 9 },
          { month: 'T5', paid: 1189, pending: 48, overdue: 11 },
          { month: 'T6', paid: 1245, pending: 55, overdue: 14 },
        ],
      };
    } catch (error) {
      console.error('❌ Mock tuition statistics error:', error);
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
