import axios from '../until/customize-axios';
import { message } from 'antd';

const scheduleService = {
  countScheduleOfWeek: async () => {
    const res = await axios.get('/api/Schedule/countSchedule');
    if (!res.success) {
      message.error(res.message || 'Không lấy được thống kê lịch tuần');
      throw new Error('Không lấy được thống kê lịch tuần');
    }
    return res;
  },

  getByDate: async (date, scheduleTypeId) => {
    const res = await axios.get('/api/Schedule/GetByDate', {
      params: { date, scheduleTypeId },
    });
    if (!res.success) {
      message.error(res.message || 'Không lấy được lịch theo ngày');
      throw new Error('Không lấy được lịch theo ngày');
    }
    return res.data;
  },
  getSchedulesOfLecturer: async (date, scheduleTypeId) => {
    try {
      const res = await axios.get('/api/Schedule/GetSchedulesOfLecturer', {
        params: { date, scheduleTypeId },
      });

      if (!res.success) {
        message.error(res.message || 'Không lấy được lịch giảng viên');
        throw new Error(res.message || 'Không lấy được lịch giảng viên');
      }

      // API returns array in data
      return res.data || [];
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        'Lỗi khi lấy lịch giảng viên';
      message.error(errMsg);
      throw error;
    }
  },
  countSchedulesOfLecturer: async () => {
    try {
      const res = await axios.get('/api/Schedule/countSchedulesOfLecturer');

      if (!res.success) {
        message.error(res.message || 'Không lấy được số lượng lịch trong tuần');
        throw new Error(
          res.message || 'Không lấy được số lượng lịch trong tuần'
        );
      }

      // returns { countScheduleOfWeek, countTestOfWeek }
      return res.data || null;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        'Lỗi khi đếm lịch giảng viên';
      message.error(errMsg);
      throw error;
    }
  },

  /**
   * Lấy tất cả lịch học theo sectionId
   */
  getAllSchedulesBySectionId: async (
    sectionId,
    pageNumber = 1,
    pageSize = 100
  ) => {
    try {
      const response = await axios.get(
        '/api/Schedule/GetAllSchedulesBySectionId',
        {
          params: {
            sectionId,
            pageNumber,
            pageSize,
          },
        }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy danh sách lịch học thất bại');
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
            error.response.data.message || 'Get schedules by section failed'
          );
        }
      } else {
        message.error(error.message || 'Get schedules by section failed');
      }
      return null;
    }
  },

  /**
   * Tạo lịch lý thuyết/thi (scheduleTypeId: 1 = Lý thuyết, 3 = Thi)
   */
  createScheduleTheory: async (scheduleData) => {
    try {
      const response = await axios.post(
        '/api/Schedule/CreateScheduleTheory',
        scheduleData
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo lịch học thất bại');
        }
        return null;
      }

      message.success('Tạo lịch học thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Create schedule failed'
          );
        }
      } else {
        message.error(error.message || 'Create schedule failed');
      }
      return null;
    }
  },

  /**
   * Cập nhật lịch học
   */
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      const response = await axios.put(
        `/api/Schedule/${scheduleId}`,
        scheduleData
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Cập nhật lịch học thất bại');
        }
        return null;
      }

      message.success('Cập nhật lịch học thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Update schedule failed'
          );
        }
      } else {
        message.error(error.message || 'Update schedule failed');
      }
      return null;
    }
  },

  /**
   * Xóa lịch học
   */
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await axios.delete(`/api/Schedule/${scheduleId}`);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Xóa lịch học thất bại');
        }
        return null;
      }

      message.success('Xóa lịch học thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Delete schedule failed'
          );
        }
      } else {
        message.error(error.message || 'Delete schedule failed');
      }
      return null;
    }
  },
};

export default scheduleService;
