import axios from '../until/customize-axios';
import { message } from 'antd';

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

  // Create new section (Admin only)
  createSection: async (sectionData) => {
    try {
      const response = await axios.post(
        '/api/Section/CreateSection',
        sectionData
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo lớp học phần thất bại');
        }
        return null;
      }
      message.success('Tạo lớp học phần thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Create section failed');
        }
      } else {
        message.error(error.message || 'Create section failed');
      }
      return null;
    }
  },
  getSectionsByLecturer: async (params = {}) => {
    try {
      const {
        sectionCode = '',
        courseName = '',
        lecturerName = '',
        semesterId = null,
        departmentId = null,
        courseId = null,
        status = null,
        sortBy = '',
        sortDirection = 'asc',
        pageNumber = 1,
        pageSize = 10,
      } = params;

      const response = await axios.get('/api/Section/GetSectionsByLecturer', {
        params: {
          SectionCode: sectionCode,
          CourseName: courseName,
          LecturerName: lecturerName,
          SemesterId: semesterId,
          DepartmentId: departmentId,
          CourseId: courseId,
          Status: status,
          SortBy: sortBy,
          SortDirection: sortDirection,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách lớp học phần thất bại'
          );
        }
        return null;
      }

      // trả về data (object với items, totalCount, ...)
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get sections by lecturer failed'
          );
        }
      } else {
        message.error(error.message || 'Get sections by lecturer failed');
      }
      return null;
    }
  },
  getSectionDropdownForLecturer: async (semesterId = null) => {
    try {
      const response = await axios.get(
        '/api/Section/GetSectionDropdownForLecturer',
        {
          params: { semesterId },
        }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách dropdown lớp học phần thất bại'
          );
        }
        return null;
      }

      // API returns array in data
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get section dropdown failed'
          );
        }
      } else {
        message.error(error.message || 'Get section dropdown failed');
      }
      return null;
    }
  },

  getSectionsIsStartingByLecturer: async () => {
    try {
      const response = await axios.get(
        '/api/Section/GetSectionsIsStartingByLecturer'
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message ||
              'Lấy danh sách lớp học phần đang hoạt động thất bại'
          );
        }
        return null;
      }

      // API returns object with items array in data
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get starting sections failed'
          );
        }
      } else {
        message.error(error.message || 'Get starting sections failed');
      }
      return null;
    }
  },

  // Lấy chi tiết lớp học phần lý thuyết
  getSectionTheoryDetail: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Section/GetSectionTheoryDetail/${sectionId}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy chi tiết lớp học phần lý thuyết thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get section theory detail failed'
          );
        }
      } else {
        message.error(error.message || 'Get section theory detail failed');
      }
      return null;
    }
  },

  // Lấy chi tiết lớp học phần thực hành
  getSectionPracticeDetail: async (sectionId, practiceGroupId = null) => {
    try {
      const url = practiceGroupId
        ? `/api/Section/GetSectionPracticeDetail/${sectionId}?practiceGroupId=${practiceGroupId}`
        : `/api/Section/GetSectionPracticeDetail/${sectionId}`;

      const response = await axios.get(url);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy chi tiết lớp học phần thực hành thất bại'
          );
        }
        return null;
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get section practice detail failed'
          );
        }
      } else {
        message.error(error.message || 'Get section practice detail failed');
      }
      return null;
    }
  },

  // Update section (Admin only)
  updateSection: async (sectionId, sectionData) => {
    try {
      const response = await axios.put(
        `/api/Section/UpdateSection/${sectionId}`,
        sectionData
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Cập nhật lớp học phần thất bại');
        }
        return null;
      }
      message.success('Cập nhật lớp học phần thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Update section failed');
        }
      } else {
        message.error(error.message || 'Update section failed');
      }
      return null;
    }
  },

  // Delete section (Admin only)
  deleteSection: async (sectionId) => {
    try {
      const response = await axios.delete(
        `/api/Section/DeleteSection/${sectionId}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Xóa lớp học phần thất bại');
        }
        return null;
      }
      message.success('Xóa lớp học phần thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'Delete section failed');
        }
      } else {
        message.error(error.message || 'Delete section failed');
      }
      return null;
    }
  },

  // Get section by ID
  getSectionById: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Section/GetSectionById/${sectionId}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy thông tin lớp học phần thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get section by ID failed'
          );
        }
      } else {
        message.error(error.message || 'Get section by ID failed');
      }
      return null;
    }
  },

  // Get all sections with filters (Admin only)
  getAllSections: async (params = {}) => {
    try {
      const {
        search = '',
        courseName = '',
        lecturerName = '',
        semesterId = null,
        departmentId = null,
        courseId = null,
        status = null,
        sortBy = '',
        sortDirection = 'asc',
        pageNumber = 1,
        pageSize = 10,
      } = params;

      const response = await axios.get('/api/Section/GetAllSection', {
        params: {
          search: search,
          CourseName: courseName,
          LecturerName: lecturerName,
          SemesterId: semesterId,
          DepartmentId: departmentId,
          CourseId: courseId,
          status: status,
          SortBy: sortBy,
          SortDirection: sortDirection,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách lớp học phần thất bại'
          );
        }
        return null;
      }

      // trả về data (object với items, totalCount, ...)
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get all sections failed'
          );
        }
      } else {
        message.error(error.message || 'Get all sections failed');
      }
      return null;
    }
  },

  // Get dropdown data for create/update section
  getSectionDropdownAll: async () => {
    try {
      const response = await axios.get('/api/Section/dropdown/all');

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy dữ liệu dropdown thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get dropdown data failed'
          );
        }
      } else {
        message.error(error.message || 'Get dropdown data failed');
      }
      return null;
    }
  },

  // Get semester dropdown for section management
  getSemesterDropdown: async () => {
    try {
      const response = await axios.get('/api/Section/dropdown/semesters');

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy danh sách học kỳ thất bại');
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Get semester dropdown failed'
          );
        }
      } else {
        message.error(error.message || 'Get semester dropdown failed');
      }
      return null;
    }
  },

  /**
   * Lấy danh sách sinh viên dự thi theo sectionId
   * @param {number} sectionId - Section ID
   */
  getExamListBySection: async (sectionId) => {
    try {
      const response = await axios.get(`/api/Section/${sectionId}/exam-list`);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy danh sách dự thi thất bại');
        }
        return null;
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy danh sách dự thi thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách dự thi thất bại');
      }
      return null;
    }
  },
};

export default sectionService;
