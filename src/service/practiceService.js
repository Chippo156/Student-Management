import axios from '../until/customize-axios';
import { message } from 'antd';

const practiceService = {
  // Lấy danh sách nhóm thực hành theo sectionId
  getPracticeGroupsBySection: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/PracticeGroup/section/${sectionId}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách nhóm thực hành thất bại'
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
              'Lấy danh sách nhóm thực hành thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách nhóm thực hành thất bại');
      }
      return null;
    }
  },

  // ✅ API tạo nhóm thực hành kèm lịch học - CẬP NHẬT THEO SWAGGER
  createSchedulePractice: async (practiceData) => {
    try {
      // ✅ Đảm bảo payload khớp với API
      const payload = {
        groupName: practiceData.groupName,
        description: practiceData.description,
        maxCapacity: practiceData.maxCapacity,
        sectionId: practiceData.sectionId,
        dayOfWeek: practiceData.dayOfWeek,
        date: practiceData.date,
        startTime: practiceData.startTime,
        endTime: practiceData.endTime,
        room: practiceData.room,
        onlineLink: practiceData.onlineLink,
        scheduleTypeId: 2, // ✅ Luôn là 2 (Thực hành)
        lecturerId: practiceData.lecturerId,
      };

      const response = await axios.post(
        '/api/PracticeGroup/CreateSchedulePractice',
        payload
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo nhóm thực hành thất bại');
        }
        return null;
      }

      message.success('Tạo nhóm thực hành thành công!');
      return response.data;
    } catch (error) {
      console.error('❌ Create practice schedule error:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Create practice schedule failed'
          );
        }
      } else {
        message.error(error.message || 'Create practice schedule failed');
      }
      return null;
    }
  },
};

export default practiceService;
