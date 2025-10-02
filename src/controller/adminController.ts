import { adminService, AdminDashboard, SystemSettings, UserManagement, CourseManagement, DepartmentManagement } from '../service/adminService';

export class AdminController {
  // Dashboard and Statistics
  static async getDashboardStats(): Promise<AdminDashboard> {
    try {
      return await adminService.getDashboardStats();
    } catch (error: any) {
      console.error('Get dashboard stats controller error:', error);
      throw error;
    }
  }

  static async getSystemStats(): Promise<any> {
    try {
      return await adminService.getSystemStats();
    } catch (error: any) {
      console.error('Get system stats controller error:', error);
      throw error;
    }
  }

  // User Management
  static async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: number;
    status?: number;
  }): Promise<any> {
    try {
      return await adminService.getAllUsers(params);
    } catch (error: any) {
      console.error('Get all users controller error:', error);
      throw error;
    }
  }

  static async getUserById(userId: number): Promise<UserManagement> {
    try {
      return await adminService.getUserById(userId);
    } catch (error: any) {
      console.error('Get user by id controller error:', error);
      throw error;
    }
  }

  static async createUser(userData: any): Promise<any> {
    try {
      return await adminService.createUser(userData);
    } catch (error: any) {
      console.error('Create user controller error:', error);
      throw error;
    }
  }

  static async updateUser(userId: number, userData: any): Promise<any> {
    try {
      return await adminService.updateUser(userId, userData);
    } catch (error: any) {
      console.error('Update user controller error:', error);
      throw error;
    }
  }

  static async deleteUser(userId: number): Promise<any> {
    try {
      return await adminService.deleteUser(userId);
    } catch (error: any) {
      console.error('Delete user controller error:', error);
      throw error;
    }
  }

  static async changeUserStatus(userId: number, status: number): Promise<any> {
    try {
      return await adminService.changeUserStatus(userId, status);
    } catch (error: any) {
      console.error('Change user status controller error:', error);
      throw error;
    }
  }

  static async resetUserPassword(userId: number, newPassword: string): Promise<any> {
    try {
      return await adminService.resetUserPassword(userId, newPassword);
    } catch (error: any) {
      console.error('Reset user password controller error:', error);
      throw error;
    }
  }

  // Student Management
  static async getAllStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    academicYear?: string;
    status?: number;
  }): Promise<any> {
    try {
      return await adminService.getAllStudents(params);
    } catch (error: any) {
      console.error('Get all students controller error:', error);
      throw error;
    }
  }

  static async getStudentById(studentId: string): Promise<any> {
    try {
      return await adminService.getStudentById(studentId);
    } catch (error: any) {
      console.error('Get student by id controller error:', error);
      throw error;
    }
  }

  static async createStudent(studentData: any): Promise<any> {
    try {
      return await adminService.createStudent(studentData);
    } catch (error: any) {
      console.error('Create student controller error:', error);
      throw error;
    }
  }

  static async updateStudent(studentId: string, studentData: any): Promise<any> {
    try {
      return await adminService.updateStudent(studentId, studentData);
    } catch (error: any) {
      console.error('Update student controller error:', error);
      throw error;
    }
  }

  static async deleteStudent(studentId: string): Promise<any> {
    try {
      return await adminService.deleteStudent(studentId);
    } catch (error: any) {
      console.error('Delete student controller error:', error);
      throw error;
    }
  }

  // Teacher Management
  static async getAllTeachers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    status?: number;
  }): Promise<any> {
    try {
      return await adminService.getAllTeachers(params);
    } catch (error: any) {
      console.error('Get all teachers controller error:', error);
      throw error;
    }
  }

  static async getTeacherById(teacherId: string): Promise<any> {
    try {
      return await adminService.getTeacherById(teacherId);
    } catch (error: any) {
      console.error('Get teacher by id controller error:', error);
      throw error;
    }
  }

  static async createTeacher(teacherData: any): Promise<any> {
    try {
      return await adminService.createTeacher(teacherData);
    } catch (error: any) {
      console.error('Create teacher controller error:', error);
      throw error;
    }
  }

  static async updateTeacher(teacherId: string, teacherData: any): Promise<any> {
    try {
      return await adminService.updateTeacher(teacherId, teacherData);
    } catch (error: any) {
      console.error('Update teacher controller error:', error);
      throw error;
    }
  }

  static async deleteTeacher(teacherId: string): Promise<any> {
    try {
      return await adminService.deleteTeacher(teacherId);
    } catch (error: any) {
      console.error('Delete teacher controller error:', error);
      throw error;
    }
  }

  // Course Management
  static async getAllCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    status?: number;
  }): Promise<any> {
    try {
      return await adminService.getAllCourses(params);
    } catch (error: any) {
      console.error('Get all courses controller error:', error);
      throw error;
    }
  }

  static async getCourseById(courseId: string): Promise<CourseManagement> {
    try {
      return await adminService.getCourseById(courseId);
    } catch (error: any) {
      console.error('Get course by id controller error:', error);
      throw error;
    }
  }

  static async createCourse(courseData: any): Promise<any> {
    try {
      return await adminService.createCourse(courseData);
    } catch (error: any) {
      console.error('Create course controller error:', error);
      throw error;
    }
  }

  static async updateCourse(courseId: string, courseData: any): Promise<any> {
    try {
      return await adminService.updateCourse(courseId, courseData);
    } catch (error: any) {
      console.error('Update course controller error:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId: string): Promise<any> {
    try {
      return await adminService.deleteCourse(courseId);
    } catch (error: any) {
      console.error('Delete course controller error:', error);
      throw error;
    }
  }

  // Department Management
  static async getAllDepartments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: number;
  }): Promise<any> {
    try {
      return await adminService.getAllDepartments(params);
    } catch (error: any) {
      console.error('Get all departments controller error:', error);
      throw error;
    }
  }

  static async getDepartmentById(departmentId: number): Promise<DepartmentManagement> {
    try {
      return await adminService.getDepartmentById(departmentId);
    } catch (error: any) {
      console.error('Get department by id controller error:', error);
      throw error;
    }
  }

  static async createDepartment(departmentData: any): Promise<any> {
    try {
      return await adminService.createDepartment(departmentData);
    } catch (error: any) {
      console.error('Create department controller error:', error);
      throw error;
    }
  }

  static async updateDepartment(departmentId: number, departmentData: any): Promise<any> {
    try {
      return await adminService.updateDepartment(departmentId, departmentData);
    } catch (error: any) {
      console.error('Update department controller error:', error);
      throw error;
    }
  }

  static async deleteDepartment(departmentId: number): Promise<any> {
    try {
      return await adminService.deleteDepartment(departmentId);
    } catch (error: any) {
      console.error('Delete department controller error:', error);
      throw error;
    }
  }

  // System Settings
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      return await adminService.getSystemSettings();
    } catch (error: any) {
      console.error('Get system settings controller error:', error);
      throw error;
    }
  }

  static async updateSystemSettings(settings: Partial<SystemSettings>): Promise<any> {
    try {
      return await adminService.updateSystemSettings(settings);
    } catch (error: any) {
      console.error('Update system settings controller error:', error);
      throw error;
    }
  }

  // Reports and Analytics
  static async getStudentReport(params?: {
    startDate?: string;
    endDate?: string;
    department?: number;
    academicYear?: string;
  }): Promise<any> {
    try {
      return await adminService.getStudentReport(params);
    } catch (error: any) {
      console.error('Get student report controller error:', error);
      throw error;
    }
  }

  static async getTeacherReport(params?: {
    startDate?: string;
    endDate?: string;
    department?: number;
  }): Promise<any> {
    try {
      return await adminService.getTeacherReport(params);
    } catch (error: any) {
      console.error('Get teacher report controller error:', error);
      throw error;
    }
  }

  static async getCourseReport(params?: {
    semester?: string;
    academicYear?: string;
    department?: number;
  }): Promise<any> {
    try {
      return await adminService.getCourseReport(params);
    } catch (error: any) {
      console.error('Get course report controller error:', error);
      throw error;
    }
  }

  static async getGradeReport(params?: {
    semester?: string;
    academicYear?: string;
    courseId?: string;
    departmentId?: number;
  }): Promise<any> {
    try {
      return await adminService.getGradeReport(params);
    } catch (error: any) {
      console.error('Get grade report controller error:', error);
      throw error;
    }
  }

  // Backup and Maintenance
  static async createBackup(): Promise<any> {
    try {
      return await adminService.createBackup();
    } catch (error: any) {
      console.error('Create backup controller error:', error);
      throw error;
    }
  }

  static async getBackupList(): Promise<any> {
    try {
      return await adminService.getBackupList();
    } catch (error: any) {
      console.error('Get backup list controller error:', error);
      throw error;
    }
  }

  static async restoreBackup(backupId: string): Promise<any> {
    try {
      return await adminService.restoreBackup(backupId);
    } catch (error: any) {
      console.error('Restore backup controller error:', error);
      throw error;
    }
  }

  static async deleteBackup(backupId: string): Promise<any> {
    try {
      return await adminService.deleteBackup(backupId);
    } catch (error: any) {
      console.error('Delete backup controller error:', error);
      throw error;
    }
  }

  // Audit Logs
  static async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      return await adminService.getAuditLogs(params);
    } catch (error: any) {
      console.error('Get audit logs controller error:', error);
      throw error;
    }
  }

  // System Health
  static async getSystemHealth(): Promise<any> {
    try {
      return await adminService.getSystemHealth();
    } catch (error: any) {
      console.error('Get system health controller error:', error);
      throw error;
    }
  }
}