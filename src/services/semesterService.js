import customizeAxios from '../utils/customize-axios';
import { toast } from '../utils/toast';

export const semesterService = {
  getStudentSemesters: async () => {
    try {
      const response = await customizeAxios.get('/api/Semester/student');
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Failed to fetch student semesters.'
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
            error.response.data.message || 'Failed to fetch student semesters.'
          );
        }
      } else {
        toast.error(error.message || 'Failed to fetch student semesters.');
      }
      return null;
    }
  },

  getSemesterByStudentAndAcceptRegister: async () => {
    try {
      const response = await customizeAxios.get(
        '/api/Semester/student/enrollment/GetSemesterByStudentAndAcceptRegister'
      );
      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            response?.message || 'Failed to fetch semesters for registration.'
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
              'Get semesters by student and accept register failed'
          );
        }
      } else {
        toast.error(
          error.message || 'Get semesters by student and accept register failed'
        );
      }
      return null;
    }
  },
};
