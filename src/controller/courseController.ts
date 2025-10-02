import { courseService, Course, CourseRegistration, CourseMaterial, CourseSchedule } from '../service/courseService';

export class CourseController {
  // Get all courses
  static async getAllCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: number;
    semester?: string;
    academicYear?: string;
    status?: number;
  }): Promise<any> {
    try {
      return await courseService.getAllCourses(params);
    } catch (error: any) {
      console.error('Get all courses controller error:', error);
      throw error;
    }
  }

  // Get course by ID
  static async getCourseById(courseId: string): Promise<Course> {
    try {
      return await courseService.getCourseById(courseId);
    } catch (error: any) {
      console.error('Get course by id controller error:', error);
      throw error;
    }
  }

  // Create new course (Admin only)
  static async createCourse(courseData: any): Promise<any> {
    try {
      return await courseService.createCourse(courseData);
    } catch (error: any) {
      console.error('Create course controller error:', error);
      throw error;
    }
  }

  // Update course (Admin only)
  static async updateCourse(courseId: string, courseData: any): Promise<any> {
    try {
      return await courseService.updateCourse(courseId, courseData);
    } catch (error: any) {
      console.error('Update course controller error:', error);
      throw error;
    }
  }

  // Delete course (Admin only)
  static async deleteCourse(courseId: string): Promise<any> {
    try {
      return await courseService.deleteCourse(courseId);
    } catch (error: any) {
      console.error('Delete course controller error:', error);
      throw error;
    }
  }

  // Get courses by department
  static async getCoursesByDepartment(departmentId: number, params?: {
    semester?: string;
    academicYear?: string;
    status?: number;
  }): Promise<any> {
    try {
      return await courseService.getCoursesByDepartment(departmentId, params);
    } catch (error: any) {
      console.error('Get courses by department controller error:', error);
      throw error;
    }
  }

  // Get available courses for registration
  static async getAvailableCourses(params?: {
    semester?: string;
    academicYear?: string;
    departmentId?: number;
  }): Promise<any> {
    try {
      return await courseService.getAvailableCourses(params);
    } catch (error: any) {
      console.error('Get available courses controller error:', error);
      throw error;
    }
  }

  // Register for course (Student only)
  static async registerForCourse(courseId: string, registrationData?: any): Promise<any> {
    try {
      return await courseService.registerForCourse(courseId, registrationData);
    } catch (error: any) {
      console.error('Register for course controller error:', error);
      throw error;
    }
  }

  // Unregister from course (Student only)
  static async unregisterFromCourse(courseId: string): Promise<any> {
    try {
      return await courseService.unregisterFromCourse(courseId);
    } catch (error: any) {
      console.error('Unregister from course controller error:', error);
      throw error;
    }
  }

  // Get registered courses for student
  static async getRegisteredCourses(params?: {
    semester?: string;
    academicYear?: string;
    status?: number;
  }): Promise<any> {
    try {
      return await courseService.getRegisteredCourses(params);
    } catch (error: any) {
      console.error('Get registered courses controller error:', error);
      throw error;
    }
  }

  // Get course schedule
  static async getCourseSchedule(courseId: string): Promise<CourseSchedule[]> {
    try {
      return await courseService.getCourseSchedule(courseId);
    } catch (error: any) {
      console.error('Get course schedule controller error:', error);
      throw error;
    }
  }

  // Get course materials
  static async getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
    try {
      return await courseService.getCourseMaterials(courseId);
    } catch (error: any) {
      console.error('Get course materials controller error:', error);
      throw error;
    }
  }

  // Upload course material (Teacher only)
  static async uploadCourseMaterial(courseId: string, file: File, title: string, description?: string): Promise<any> {
    try {
      return await courseService.uploadCourseMaterial(courseId, file, title, description);
    } catch (error: any) {
      console.error('Upload course material controller error:', error);
      throw error;
    }
  }

  // Delete course material (Teacher only)
  static async deleteCourseMaterial(courseId: string, materialId: string): Promise<any> {
    try {
      return await courseService.deleteCourseMaterial(courseId, materialId);
    } catch (error: any) {
      console.error('Delete course material controller error:', error);
      throw error;
    }
  }

  // Get students in course
  static async getStudentsInCourse(courseId: string): Promise<any> {
    try {
      return await courseService.getStudentsInCourse(courseId);
    } catch (error: any) {
      console.error('Get students in course controller error:', error);
      throw error;
    }
  }

  // Get course prerequisites
  static async getCoursePrerequisites(courseId: string): Promise<any> {
    try {
      return await courseService.getCoursePrerequisites(courseId);
    } catch (error: any) {
      console.error('Get course prerequisites controller error:', error);
      throw error;
    }
  }

  // Check course prerequisites for student
  static async checkCoursePrerequisites(courseId: string): Promise<any> {
    try {
      return await courseService.checkCoursePrerequisites(courseId);
    } catch (error: any) {
      console.error('Check course prerequisites controller error:', error);
      throw error;
    }
  }

  // Get course statistics
  static async getCourseStatistics(courseId: string): Promise<any> {
    try {
      return await courseService.getCourseStatistics(courseId);
    } catch (error: any) {
      console.error('Get course statistics controller error:', error);
      throw error;
    }
  }

  // Search courses
  static async searchCourses(query: string, filters?: {
    department?: number;
    credits?: number;
    semester?: string;
    academicYear?: string;
  }): Promise<any> {
    try {
      return await courseService.searchCourses(query, filters);
    } catch (error: any) {
      console.error('Search courses controller error:', error);
      throw error;
    }
  }

  // Get course by code
  static async getCourseByCode(courseCode: string): Promise<Course> {
    try {
      return await courseService.getCourseByCode(courseCode);
    } catch (error: any) {
      console.error('Get course by code controller error:', error);
      throw error;
    }
  }

  // Get course enrollments
  static async getCourseEnrollments(courseId: string, params?: {
    status?: number;
    semester?: string;
    academicYear?: string;
  }): Promise<any> {
    try {
      return await courseService.getCourseEnrollments(courseId, params);
    } catch (error: any) {
      console.error('Get course enrollments controller error:', error);
      throw error;
    }
  }

  // Bulk enroll students (Admin/Teacher)
  static async bulkEnrollStudents(courseId: string, studentIds: string[]): Promise<any> {
    try {
      return await courseService.bulkEnrollStudents(courseId, studentIds);
    } catch (error: any) {
      console.error('Bulk enroll students controller error:', error);
      throw error;
    }
  }

  // Bulk unenroll students (Admin/Teacher)
  static async bulkUnenrollStudents(courseId: string, studentIds: string[]): Promise<any> {
    try {
      return await courseService.bulkUnenrollStudents(courseId, studentIds);
    } catch (error: any) {
      console.error('Bulk unenroll students controller error:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  static async getCourseStudents(courseId: string, params?: any): Promise<any> {
    try {
      return await CourseController.getStudentsInCourse(courseId);
    } catch (error: any) {
      console.error('Get course students controller error:', error);
      throw error;
    }
  }

  static async addStudentToCourse(courseId: string, studentId: string): Promise<any> {
    try {
      return await CourseController.bulkEnrollStudents(courseId, [studentId]);
    } catch (error: any) {
      console.error('Add student to course controller error:', error);
      throw error;
    }
  }

  static async removeStudentFromCourse(courseId: string, studentId: string): Promise<any> {
    try {
      return await CourseController.bulkUnenrollStudents(courseId, [studentId]);
    } catch (error: any) {
      console.error('Remove student from course controller error:', error);
      throw error;
    }
  }

  static async getCourseLectures(courseId: string, params?: any): Promise<any> {
    try {
      return await CourseController.getCourseSchedule(courseId);
    } catch (error: any) {
      console.error('Get course lectures controller error:', error);
      throw error;
    }
  }

  static async createLecture(courseId: string, data: any): Promise<any> {
    try {
      return await courseService.createLecture(courseId, data);
    } catch (error: any) {
      console.error('Create lecture controller error:', error);
      throw error;
    }
  }

  static async updateLecture(courseId: string, lectureId: string, data: any): Promise<any> {
    try {
      return await courseService.updateLecture(courseId, lectureId, data);
    } catch (error: any) {
      console.error('Update lecture controller error:', error);
      throw error;
    }
  }

  static async deleteLecture(courseId: string, lectureId: string): Promise<any> {
    try {
      return await courseService.deleteLecture(courseId, lectureId);
    } catch (error: any) {
      console.error('Delete lecture controller error:', error);
      throw error;
    }
  }

  static async getCourseGrades(courseId: string, params?: any): Promise<any> {
    try {
      return await courseService.getCourseGrades(courseId, params);
    } catch (error: any) {
      console.error('Get course grades controller error:', error);
      throw error;
    }
  }

  static async updateStudentGrade(courseId: string, studentId: string, data: any): Promise<any> {
    try {
      return await courseService.updateStudentGrade(courseId, studentId, data);
    } catch (error: any) {
      console.error('Update student grade controller error:', error);
      throw error;
    }
  }
}