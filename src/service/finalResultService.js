import axios from '../until/customize-axios';
import { message } from 'antd';

const gradeService = {
  getMyAllGrades: async () => {
    try {
      const response = await axios.get('/api/Grade/GetMyAllGrades');
      return response.data;
    } catch (error) {
      message.error(error.response?.data?.message || 'Get all grades failed');
      return null;
    }
  },
};

export default gradeService;
