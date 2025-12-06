import customizeAxios from '../utils/customize-axios';
import { toast } from '../utils/toast';

export const lecturerService = {
  getAllLecturers: async (pageNumber, pageSize, search = '', filters = {}) => {
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      // Add filter parameters
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.position) params.position = filters.position;
      if (filters.academicTitle) params.academicTitle = filters.academicTitle;
      if (filters.lecturerStatus !== undefined && filters.lecturerStatus !== '') {
        params.lecturerStatus = filters.lecturerStatus;
      }

      const response = await customizeAxios.get('/api/Lecturer/GetAllLecturers', { params });
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Lấy danh sách giảng viên thất bại'
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
            error.response.data.message || 'Lấy danh sách giảng viên thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy danh sách giảng viên thất bại');
      }
      return null;
    }
  },

  // Lấy danh sách giảng viên theo chuyên ngành cho dropdown
  getLecturersByDepartment: async (departmentId) => {
    try {
      const response = await customizeAxios.get(
        '/api/Lecturer/GetLecturerDropdownByDepartmentId',
        { params: { departmentId } }
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Lấy danh sách giảng viên thất bại'
          );
        }
        return null;
      }
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Lấy danh sách giảng viên thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy danh sách giảng viên thất bại');
      }
      return null;
    }
  },
};
