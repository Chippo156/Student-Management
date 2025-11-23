import axios from '../until/customize-axios';
import { message } from 'antd';

const attendanceService = {
  /**
   * Lấy thống kê điểm danh của học phần
   * @param {number} sectionId - Section ID
   */
  getAttendanceStatistics: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Attendance/section/${sectionId}/statistics`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy thống kê điểm danh thất bại');
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
            error.response.data.message || 'Lấy thống kê điểm danh thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy thống kê điểm danh thất bại');
      }
      return null;
    }
  },

  /**
   * Export dữ liệu điểm danh của học phần
   * @param {number} sectionId - Section ID
   */
  exportAttendanceData: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Attendance/section/${sectionId}/export`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Export dữ liệu điểm danh thất bại');
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
            error.response.data.message || 'Export dữ liệu điểm danh thất bại'
          );
        }
      } else {
        message.error(error.message || 'Export dữ liệu điểm danh thất bại');
      }
      return null;
    }
  },
};

export default attendanceService;
