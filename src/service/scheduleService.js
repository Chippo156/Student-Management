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
      params: { date, scheduleTypeId }
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
      const errMsg = error?.response?.data?.message || error.message || 'Lỗi khi lấy lịch giảng viên';
      message.error(errMsg);
      throw error;
    }
  },
  countSchedulesOfLecturer: async () => {
    try {
      const res = await axios.get('/api/Schedule/countSchedulesOfLecturer');

      if (!res.success) {
        message.error(res.message || 'Không lấy được số lượng lịch trong tuần');
        throw new Error(res.message || 'Không lấy được số lượng lịch trong tuần');
      }

      // returns { countScheduleOfWeek, countTestOfWeek }
      return res.data || null;
    } catch (error) {
      const errMsg = error?.response?.data?.message || error.message || 'Lỗi khi đếm lịch giảng viên';
      message.error(errMsg);
      throw error;
    }
  },
};

export default scheduleService;