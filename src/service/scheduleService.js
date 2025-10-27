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
    console.log(res)
    if (!res.success) {
      message.error(res.message || 'Không lấy được lịch theo ngày');
      throw new Error('Không lấy được lịch theo ngày');
    }
    return res.data;
  },
};

export default scheduleService;