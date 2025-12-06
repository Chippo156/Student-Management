import axios from '../utils/customize-axios';
import { toast } from '../utils/toast';

export const adviserAssignmentService = {
  // Gán giảng viên làm chủ nhiệm lớp
  assignLecturerToClass: async (lecturerId, classId) => {
    try {
      const response = await axios.post(
        '/api/AdviserAssignment/AssignLecturerToClass',
        null,
        {
          params: { lecturerId, classId }
        }
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Gán quyền chủ nhiệm thất bại'
          );
        }
        return null;
      }
      toast.success('Gán quyền chủ nhiệm thành công!');
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Gán quyền chủ nhiệm thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Gán quyền chủ nhiệm thất bại');
      }
      return null;
    }
  },
};
