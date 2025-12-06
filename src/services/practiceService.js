import axios from '../utils/customize-axios';
import { toast } from '../utils/toast';

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
          toast.error(errData[0]);
        } else {
          toast.error(
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
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message ||
              'Lấy danh sách nhóm thực hành thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy danh sách nhóm thực hành thất bại');
      }
      return null;
    }
  },

  /**
   * Tạo nhóm thực hành kèm lịch học (scheduleTypeId = 2)
   */
  createSchedulePractice: async (practiceData) => {
    try {
      const response = await axios.post(
        '/api/PracticeGroup/CreateSchedulePractice',
        practiceData
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Tạo nhóm thực hành thất bại');
        }
        return null;
      }

      toast.success('Tạo nhóm thực hành thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Create practice schedule failed'
          );
        }
      } else {
        toast.error(error.message || 'Create practice schedule failed');
      }
      return null;
    }
  },
};

export default practiceService;
