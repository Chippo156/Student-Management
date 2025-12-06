import axios from '../utils/customize-axios';
import { toast } from '../utils/toast';

const facultyService = {
  getFacultiesDropdown: async () => {
    try {
      const response = await axios.get('/api/Faculty/dropdown/Faculties');
      if (response?.data?.success === false) {
        const errData = response?.data?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.data?.message || 'Lấy danh sách khoa thất bại'
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
            error.response.data.message || 'Lấy danh sách khoa thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy danh sách khoa thất bại');
      }
      return null;
    }
  },
};

export default facultyService;
