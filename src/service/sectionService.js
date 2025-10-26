import axios from '../until/customize-axios';

const sectionService = {
  getSectionsByCurriculumCourseAndSemester: async (
    curriculumCourseId,
    semesterId
  ) => {
    try {
      const response = await axios.get(
        `/api/Section/GetSectionsByCurriculumCourseAndSemester/${curriculumCourseId}/${semesterId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Get sections by curriculum course and semester failed'
      );
    }
  },
  getSectionScheduleWithRegistration: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Section/GetSectionScheduleWithRegistration/${sectionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Get section schedule with registration failed'
      );
    }
  },
};

export default sectionService;
