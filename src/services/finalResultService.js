import axios from '../utils/customize-axios';
import { toast } from '../utils/toast';

const gradeService = {
  getMyAllGrades: async () => {
    try {
      const response = await axios.get('/api/Grade/GetMyAllGrades');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Get all grades failed');
      return null;
    }
  },
};

export default gradeService;
