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

      return res.data;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        'Lỗi khi đếm lịch giảng viên';
      message.error(errMsg);
      throw error;
    }
  },

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

  // ✅ API tạo lịch lý thuyết/thi - CẬP NHẬT THEO SWAGGER
  createScheduleTheory: async (scheduleData) => {
    try {
      // ✅ Đảm bảo payload khớp với API
      const payload = {
        sectionId: scheduleData.sectionId,
        scheduleTypeId: scheduleData.scheduleTypeId,
        date: scheduleData.date,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        room: scheduleData.room || '',
        onlineLink: scheduleData.onlineLink,
        practiceGroupId: null,
        practiceGroupName: null,
        lecturerId: scheduleData.lecturerId,
        maxCapacity: null,
      };

      console.log('📤 Creating theory/exam schedule with payload:', payload);

      const response = await axios.post(
        '/api/Schedule/CreateScheduleTheory',
        payload
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
      console.error('❌ Create theory schedule error:', error);
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

  // ✅ API update lịch - THÊM ĐẦY ĐỦ FIELD THEO SWAGGER
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      // ✅ Payload đầy đủ theo đúng Swagger
      const payload = {
        sectionId: scheduleData.sectionId,
        scheduleTypeId: scheduleData.scheduleTypeId,
        date: scheduleData.date,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        room: scheduleData.room || '',
        onlineLink: scheduleData.onlineLink,
        practiceGroupId: scheduleData.practiceGroupId,
        practiceGroupName: scheduleData.practiceGroupName,
        lecturerId: scheduleData.lecturerId,
        maxCapacity: scheduleData.maxCapacity,
      };

      console.log('📤 Updating schedule with payload:', payload);

      const response = await axios.put(`/api/Schedule/${scheduleId}`, payload);

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
      console.error('❌ Update schedule error:', error);
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
      return response;
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
