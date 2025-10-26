import customizeAxios from '../until/customize-axios';
import { message } from 'antd';

export const semesterService = {
  getStudentSemesters: async () => {
    const response = await customizeAxios.get('/api/Semester/student');
    if (!response.success) {
      message.error('Failed to fetch student semesters.');
    }
    return response.data;
  },

  getSemesterByStudentAndAcceptRegister: async () => {
    try {
      const response = await customizeAxios.get(
        '/api/Semester/student/enrollment/GetSemesterByStudentAndAcceptRegister'
      );
      if (!response.success) {
        message.error('Failed to fetch semesters for registration.');
      }
      return response.data;
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          'Get semesters by student and accept register failed'
      );
      return null;
    }
  },
};
