import api from '../utils/customize-axios';
import { toast } from '../utils/toast';

const academicProgramService = {
  // Existing method
  getMyProgramCurriculum: async () => {
    try {
      const response = await api.get(
        '/api/AcademicProgram/GetMyProgramCurriculum'
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
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
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Get program curriculum failed'
          );
        }
      } else {
        toast.error(error.message || 'Get program curriculum failed');
      }
      return null;
    }
  },

  // New method for admin
  getAllPrograms: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        programName = '',
        departmentId = null,
        degreeLevel = '',
      } = params;

      const response = await api.get('/api/AcademicProgram/GetAllProgram', {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          programName,
          departmentId,
          degreeLevel,
        },
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Lấy danh sách chương trình đào tạo thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error in getAllPrograms:', error);
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Get academic programs failed'
          );
        }
      } else {
        toast.error(error.message || 'Get academic programs failed');
      }
      return null;
    }
  },
  createProgram: async (programData) => {
    try {
      const response = await api.post(
        '/api/AcademicProgram/CreateProgram',
        programData
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Tạo chương trình đào tạo thất bại'
          );
        }
        return null;
      }
      toast.success('Tạo chương trình đào tạo thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(error.response.data.message || 'Create program failed');
        }
      } else {
        toast.error(error.message || 'Create program failed');
      }
      return null;
    }
  },

  // Lấy danh sách chương trình đào tạo theo chuyên ngành
  getProgramsByDepartment: async (departmentId) => {
    try {
      const response = await api.get(
        `/api/AcademicProgram/department/${departmentId}`
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Lấy danh sách chương trình đào tạo thất bại'
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
              'Lấy danh sách chương trình đào tạo thất bại'
          );
        }
      } else {
        toast.error(
          error.message || 'Lấy danh sách chương trình đào tạo thất bại'
        );
      }
      return null;
    }
  },
};

export default academicProgramService;
