import axios from "../until/customize-axios";

export interface AdminDashboard {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalDepartments: number;
  activeUsers: number;
  recentRegistrations: number;
  systemStatus: string;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  academicYear: string;
  currentSemester: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface UserManagement {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: number;
  status: number;
  createdAt: string;
  lastLogin: string;
}

export interface CourseManagement {
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  departmentId: number;
  departmentName: string;
  description: string;
  prerequisites: string[];
  status: number;
}

export interface DepartmentManagement {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  description: string;
  headOfDepartment: string;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  status: number;
}

export const adminService = {
  // Dashboard and Statistics
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/dashboard");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get dashboard stats failed');
    }
  },

  getSystemStats: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/system-stats");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get system stats failed');
    }
  },

  // User Management
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: number;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/users", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all users failed');
    }
  },

  getUserById: async (userId: number): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get user by id failed');
    }
  },

  createUser: async (userData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/users", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create user failed');
    }
  },

  updateUser: async (userId: number, userData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Admin/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update user failed');
    }
  },

  deleteUser: async (userId: number): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete user failed');
    }
  },

  // changeUserStatus: async (userId: number, status: number): Promise<any> => {
  //   try {
  //     const response = await axios.patch(`/api/v1/Admin/users/${userId}/status`, { status });
  //     return response.data;
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || 'Change user status failed');
  //   }
  // },

  // resetUserPassword: async (userId: number, newPassword: string): Promise<any> => {
  //   try {
  //     const response = await axios.patch(`/api/v1/Admin/users/${userId}/reset-password`, { newPassword });
  //     return response.data;
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || 'Reset user password failed');
  //   }
  // },

  // Student Management
  getAllStudents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    academicYear?: string;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/students", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all students failed');
    }
  },

  getStudentById: async (studentId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Admin/students/${studentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student by id failed');
    }
  },

  createStudent: async (studentData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/students", studentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create student failed');
    }
  },

  updateStudent: async (studentId: string, studentData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Admin/students/${studentId}`, studentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update student failed');
    }
  },

  deleteStudent: async (studentId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/students/${studentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete student failed');
    }
  },

  // Teacher Management
  getAllTeachers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/teachers", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all teachers failed');
    }
  },

  getTeacherById: async (teacherId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Admin/teachers/${teacherId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get teacher by id failed');
    }
  },

  createTeacher: async (teacherData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/teachers", teacherData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create teacher failed');
    }
  },

  updateTeacher: async (teacherId: string, teacherData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Admin/teachers/${teacherId}`, teacherData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update teacher failed');
    }
  },

  deleteTeacher: async (teacherId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/teachers/${teacherId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete teacher failed');
    }
  },

  // Course Management
  getAllCourses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/courses", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all courses failed');
    }
  },

  getCourseById: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Admin/courses/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course by id failed');
    }
  },

  createCourse: async (courseData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/courses", courseData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create course failed');
    }
  },

  updateCourse: async (courseId: string, courseData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Admin/courses/${courseId}`, courseData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update course failed');
    }
  },

  deleteCourse: async (courseId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/courses/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete course failed');
    }
  },

  // Department Management
  getAllDepartments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/departments", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get all departments failed');
    }
  },

  getDepartmentById: async (departmentId: number): Promise<any> => {
    try {
      const response = await axios.get(`/api/v1/Admin/departments/${departmentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get department by id failed');
    }
  },

  createDepartment: async (departmentData: any): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/departments", departmentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create department failed');
    }
  },

  updateDepartment: async (departmentId: number, departmentData: any): Promise<any> => {
    try {
      const response = await axios.put(`/api/v1/Admin/departments/${departmentId}`, departmentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update department failed');
    }
  },

  deleteDepartment: async (departmentId: number): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/departments/${departmentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete department failed');
    }
  },

  // System Settings
  getSystemSettings: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/settings");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get system settings failed');
    }
  },

  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<any> => {
    try {
      const response = await axios.put("/api/v1/Admin/settings", settings);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update system settings failed');
    }
  },

  // Reports and Analytics
  getStudentReport: async (params?: {
    startDate?: string;
    endDate?: string;
    department?: number;
    academicYear?: string;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/reports/students", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get student report failed');
    }
  },

  getTeacherReport: async (params?: {
    startDate?: string;
    endDate?: string;
    department?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/reports/teachers", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get teacher report failed');
    }
  },

  getCourseReport: async (params?: {
    semester?: string;
    academicYear?: string;
    department?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/reports/courses", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get course report failed');
    }
  },

  getGradeReport: async (params?: {
    semester?: string;
    academicYear?: string;
    courseId?: string;
    departmentId?: number;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/reports/grades", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get grade report failed');
    }
  },

  // Backup and Maintenance
  createBackup: async (): Promise<any> => {
    try {
      const response = await axios.post("/api/v1/Admin/backup");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Create backup failed');
    }
  },

  getBackupList: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/backup");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get backup list failed');
    }
  },

  restoreBackup: async (backupId: string): Promise<any> => {
    try {
      const response = await axios.post(`/api/v1/Admin/backup/${backupId}/restore`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Restore backup failed');
    }
  },

  deleteBackup: async (backupId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/v1/Admin/backup/${backupId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete backup failed');
    }
  },

  // Audit Logs
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    userId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/audit-logs", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get audit logs failed');
    }
  },

  // System Health
  getSystemHealth: async (): Promise<any> => {
    try {
      const response = await axios.get("/api/v1/Admin/health");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get system health failed');
    }
  }
};