import axios from '../until/customize-axios';
import { message } from 'antd';

const academicProgramService = {
  getMyProgramCurriculum: async () => {
    try {
      const response = await axios.get(
        '/api/AcademicProgram/GetMyProgramCurriculum'
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy chương trình đào tạo thất bại'
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
            error.response.data.message || 'Get program curriculum failed'
          );
        }
      } else {
        message.error(error.message || 'Get program curriculum failed');
      }
      return null;
    }
  },
};

export default academicProgramService;
