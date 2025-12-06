import axios from '../utils/customize-axios';
import { toast } from '../utils/toast';

export const courseService = {
  // Get all courses with pagination and search
  getAllCourses: async (pageNumber = 1, pageSize = 10, search = '') => {
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      const response = await axios.get('/api/v1/Course', { params });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Lấy danh sách môn học thất bại');
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
            error.response.data.message || 'Lấy danh sách môn học thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy danh sách môn học thất bại');
      }
      return null;
    }
  },
  getCoursesWithPrograms: async (params) => {
    try {
      const queryParams = {
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
      };

      if (params.search && params.search.trim() !== '') {
        queryParams.search = params.search.trim();
      }

      if (params.courseType && params.courseType !== '') {
        queryParams.courseType = params.courseType;
      }

      const response = await axios.get('/api/Course/GetCoursesWithPrograms', {
        params: queryParams,
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Lấy danh sách môn học thất bại');
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
            error.response.data.message || 'Lấy danh sách môn học thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy danh sách môn học thất bại');
      }
      return null;
    }
  },
};
