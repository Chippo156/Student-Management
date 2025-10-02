import { teacherService, TeacherInfo, TeacherCourse, TeacherSchedule, StudentGradeInput } from '../service/teacherService';

export class TeacherController {
  // Get teacher information
  static async getTeacherInfo(): Promise<TeacherInfo> {
    try {
      return await teacherService.getTeacherInfo();
    } catch (error: any) {
      console.error('Get teacher info controller error:', error);
      throw error;
    }
  }

  // Update teacher information
  static async updateTeacherInfo(data: Partial<TeacherInfo>): Promise<any> {
    try {
      return await teacherService.updateTeacherInfo(data);
    } catch (error: any) {
      console.error('Update teacher info controller error:', error);
      throw error;
    }
  }

  // Get teacher courses
  static async getTeacherCourses(semester?: string, academicYear?: string): Promise<TeacherCourse[]> {
    try {
      return await teacherService.getTeacherCourses(semester, academicYear);
    } catch (error: any) {
      console.error('Get teacher courses controller error:', error);
      throw error;
    }
  }

  // Get teacher schedule
  static async getTeacherSchedule(semester?: string, academicYear?: string): Promise<TeacherSchedule[]> {
    try {
      return await teacherService.getTeacherSchedule(semester, academicYear);
    } catch (error: any) {
      console.error('Get teacher schedule controller error:', error);
      throw error;
    }
  }

  // Get students in course
  static async getStudentsInCourse(courseId: string): Promise<any> {
    try {
      return await teacherService.getStudentsInCourse(courseId);
    } catch (error: any) {
      console.error('Get students in course controller error:', error);
      throw error;
    }
  }

  // Get student grades in course
  static async getStudentGrades(courseId: string): Promise<any> {
    try {
      return await teacherService.getStudentGrades(courseId);
    } catch (error: any) {
      console.error('Get student grades controller error:', error);
      throw error;
    }
  }

  // Update student grades
  static async updateStudentGrades(courseId: string, grades: StudentGradeInput[]): Promise<any> {
    try {
      return await teacherService.updateStudentGrades(courseId, grades);
    } catch (error: any) {
      console.error('Update student grades controller error:', error);
      throw error;
    }
  }

  // Update single student grade
  static async updateStudentGrade(courseId: string, studentId: string, gradeData: StudentGradeInput): Promise<any> {
    try {
      return await teacherService.updateStudentGrade(courseId, studentId, gradeData);
    } catch (error: any) {
      console.error('Update student grade controller error:', error);
      throw error;
    }
  }

  // Get course materials
  static async getCourseMaterials(courseId: string): Promise<any> {
    try {
      return await teacherService.getCourseMaterials(courseId);
    } catch (error: any) {
      console.error('Get course materials controller error:', error);
      throw error;
    }
  }

  // Upload course material
  static async uploadCourseMaterial(courseId: string, file: File, title: string, description?: string): Promise<any> {
    try {
      return await teacherService.uploadCourseMaterial(courseId, file, title, description);
    } catch (error: any) {
      console.error('Upload course material controller error:', error);
      throw error;
    }
  }

  // Delete course material
  static async deleteCourseMaterial(courseId: string, materialId: string): Promise<any> {
    try {
      return await teacherService.deleteCourseMaterial(courseId, materialId);
    } catch (error: any) {
      console.error('Delete course material controller error:', error);
      throw error;
    }
  }

  // Get attendance records
  static async getAttendanceRecords(courseId: string): Promise<any> {
    try {
      return await teacherService.getAttendanceRecords(courseId);
    } catch (error: any) {
      console.error('Get attendance records controller error:', error);
      throw error;
    }
  }

  // Take attendance
  static async takeAttendance(courseId: string, date: string, attendanceData: any[]): Promise<any> {
    try {
      return await teacherService.takeAttendance(courseId, date, attendanceData);
    } catch (error: any) {
      console.error('Take attendance controller error:', error);
      throw error;
    }
  }

  // Get assignments
  static async getAssignments(courseId: string): Promise<any> {
    try {
      return await teacherService.getAssignments(courseId);
    } catch (error: any) {
      console.error('Get assignments controller error:', error);
      throw error;
    }
  }

  // Create assignment
  static async createAssignment(courseId: string, assignmentData: any): Promise<any> {
    try {
      return await teacherService.createAssignment(courseId, assignmentData);
    } catch (error: any) {
      console.error('Create assignment controller error:', error);
      throw error;
    }
  }

  // Update assignment
  static async updateAssignment(courseId: string, assignmentId: string, assignmentData: any): Promise<any> {
    try {
      return await teacherService.updateAssignment(courseId, assignmentId, assignmentData);
    } catch (error: any) {
      console.error('Update assignment controller error:', error);
      throw error;
    }
  }

  // Delete assignment
  static async deleteAssignment(courseId: string, assignmentId: string): Promise<any> {
    try {
      return await teacherService.deleteAssignment(courseId, assignmentId);
    } catch (error: any) {
      console.error('Delete assignment controller error:', error);
      throw error;
    }
  }

  // Admin functions for managing teachers
  // Get all teachers (Admin only)
  static async getAllTeachers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
  }): Promise<any> {
    try {
      return await teacherService.getAllTeachers(params);
    } catch (error: any) {
      console.error('Get all teachers controller error:', error);
      throw error;
    }
  }

  // Get teacher by ID (Admin only)
  static async getTeacherById(teacherId: string): Promise<any> {
    try {
      return await teacherService.getTeacherById(teacherId);
    } catch (error: any) {
      console.error('Get teacher by id controller error:', error);
      throw error;
    }
  }

  // Create teacher (Admin only)
  static async createTeacher(teacherData: any): Promise<any> {
    try {
      return await teacherService.createTeacher(teacherData);
    } catch (error: any) {
      console.error('Create teacher controller error:', error);
      throw error;
    }
  }

  // Delete teacher (Admin only)
  static async deleteTeacher(teacherId: string): Promise<any> {
    try {
      return await teacherService.deleteTeacher(teacherId);
    } catch (error: any) {
      console.error('Delete teacher controller error:', error);
      throw error;
    }
  }

  // Assign course to teacher (Admin only)
  static async assignCourseToTeacher(teacherId: string, courseId: string, assignmentData: any): Promise<any> {
    try {
      return await teacherService.assignCourseToTeacher(teacherId, courseId, assignmentData);
    } catch (error: any) {
      console.error('Assign course to teacher controller error:', error);
      throw error;
    }
  }

  // Remove course from teacher (Admin only)
  static async removeCourseFromTeacher(teacherId: string, courseId: string): Promise<any> {
    try {
      return await teacherService.removeCourseFromTeacher(teacherId, courseId);
    } catch (error: any) {
      console.error('Remove course from teacher controller error:', error);
      throw error;
    }
  }
}