import axios from '../until/customize-axios';

// Đã loại bỏ toàn bộ interface/type của TypeScript, chỉ giữ lại JS thuần

export const adminService = {
  // Đổi mật khẩu
  resetPassword: async (passwordData) => {
    try {
      const response = await axios.put('/api/User/ResetPassword', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Reset password failed'
      );
    }
  },

  // Dashboard and Statistics
  getDashboardStats: async () => {
    try {
      const response = await axios.get('/api/v1/Admin/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get dashboard stats failed'
      );
    }
  },

  getSystemStats: async () => {
    try {
      const response = await axios.get('/api/v1/Admin/system-stats');
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get system stats failed'
      );
    }
  },

  // User Management
  getAllUsers: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Get all users failed');
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axios.get(`/api/v1/Admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get user by id failed'
      );
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post('/api/v1/Admin/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Create user failed');
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(
        `/api/v1/Admin/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Update user failed');
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/v1/Admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Delete user failed');
    }
  },

  // Student Management
  getAllStudents: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/students', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get all students failed'
      );
    }
  },

  getStudentById: async (studentId) => {
    try {
      const response = await axios.get(`/api/v1/Admin/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get student by id failed'
      );
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await axios.post('/api/v1/Admin/students', studentData);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Create student failed'
      );
    }
  },

  updateStudent: async (studentId, studentData) => {
    try {
      const response = await axios.put(
        `/api/v1/Admin/students/${studentId}`,
        studentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Update student failed'
      );
    }
  },

  deleteStudent: async (studentId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Admin/students/${studentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Delete student failed'
      );
    }
  },

  // Teacher Management
  getAllTeachers: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/teachers', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get all teachers failed'
      );
    }
  },

  getTeacherById: async (teacherId) => {
    try {
      const response = await axios.get(`/api/v1/Admin/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get teacher by id failed'
      );
    }
  },

  createTeacher: async (teacherData) => {
    try {
      const response = await axios.post('/api/v1/Admin/teachers', teacherData);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Create teacher failed'
      );
    }
  },

  updateTeacher: async (teacherId, teacherData) => {
    try {
      const response = await axios.put(
        `/api/v1/Admin/teachers/${teacherId}`,
        teacherData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Update teacher failed'
      );
    }
  },

  deleteTeacher: async (teacherId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Admin/teachers/${teacherId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Delete teacher failed'
      );
    }
  },

  // Course Management
  getAllCourses: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/courses', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get all courses failed'
      );
    }
  },

  getCourseById: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/Admin/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get course by id failed'
      );
    }
  },

  createCourse: async (courseData) => {
    try {
      const response = await axios.post('/api/v1/Admin/courses', courseData);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Create course failed');
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axios.put(
        `/api/v1/Admin/courses/${courseId}`,
        courseData
      );
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Update course failed');
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await axios.delete(`/api/v1/Admin/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Delete course failed');
    }
  },

  // Department Management
  getAllDepartments: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/departments', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get all departments failed'
      );
    }
  },

  getDepartmentById: async (departmentId) => {
    try {
      const response = await axios.get(
        `/api/v1/Admin/departments/${departmentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get department by id failed'
      );
    }
  },

  createDepartment: async (departmentData) => {
    try {
      const response = await axios.post(
        '/api/v1/Admin/departments',
        departmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Create department failed'
      );
    }
  },

  updateDepartment: async (departmentId, departmentData) => {
    try {
      const response = await axios.put(
        `/api/v1/Admin/departments/${departmentId}`,
        departmentData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Update department failed'
      );
    }
  },

  deleteDepartment: async (departmentId) => {
    try {
      const response = await axios.delete(
        `/api/v1/Admin/departments/${departmentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Delete department failed'
      );
    }
  },

  // System Settings
  getSystemSettings: async () => {
    try {
      const response = await axios.get('/api/v1/Admin/settings');
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get system settings failed'
      );
    }
  },

  updateSystemSettings: async (settings) => {
    try {
      const response = await axios.put('/api/v1/Admin/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Update system settings failed'
      );
    }
  },

  // Reports and Analytics
  getStudentReport: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/reports/students', {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get student report failed'
      );
    }
  },

  getTeacherReport: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/reports/teachers', {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get teacher report failed'
      );
    }
  },

  getCourseReport: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/reports/courses', {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get course report failed'
      );
    }
  },

  getGradeReport: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/reports/grades', {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get grade report failed'
      );
    }
  },

  // Backup and Maintenance
  createBackup: async () => {
    try {
      const response = await axios.post('/api/v1/Admin/backup');
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Create backup failed');
    }
  },

  getBackupList: async () => {
    try {
      const response = await axios.get('/api/v1/Admin/backup');
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get backup list failed'
      );
    }
  },

  restoreBackup: async (backupId) => {
    try {
      const response = await axios.post(
        `/api/v1/Admin/backup/${backupId}/restore`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Restore backup failed'
      );
    }
  },

  deleteBackup: async (backupId) => {
    try {
      const response = await axios.delete(`/api/v1/Admin/backup/${backupId}`);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Delete backup failed');
    }
  },

  // Audit Logs
  getAuditLogs: async (params) => {
    try {
      const response = await axios.get('/api/v1/Admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get audit logs failed'
      );
    }
  },

  // System Health
  getSystemHealth: async () => {
    try {
      const response = await axios.get('/api/v1/Admin/health');
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || 'Get system health failed'
      );
    }
  },
};
