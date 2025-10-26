import axios from '../until/customize-axios';
import { message } from 'antd';

const academicProgramService = {
  getMyProgramCurriculum: async () => {
    try {
      const response = await axios.get(
        '/api/AcademicProgram/GetMyProgramCurriculum'
      );
      return response.data;
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Get program curriculum failed'
      );
      return null;
    }
  },
};

export default academicProgramService;
