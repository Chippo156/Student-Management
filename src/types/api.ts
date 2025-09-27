// API Types and Request/Response interfaces

import { User, Student, Course, Class, Program, Faculty, Department } from './database';

// Generic API Response
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  result?: T;
  success?: boolean;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
  fullName: string;
  address?: string;
  gender: number;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface IntrospectRequest {
  token: string;
}

// User Management
export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Student Management
export interface CreateStudentRequest {
  userId: number;
  mssv: string;
  classId: number;
}

export interface UpdateStudentRequest {
  mssv?: string;
  classId?: number;
}

// Course Management
export interface CreateCourseRequest {
  courseCode: string;
  courseName: string;
  creditsTheory: number;
  creditsLab: number;
}

export interface UpdateCourseRequest {
  courseCode?: string;
  courseName?: string;
  creditsTheory?: number;
  creditsLab?: number;
}

// Class Management
export interface CreateClassRequest {
  className: string;
  programId: number;
}

export interface UpdateClassRequest {
  className?: string;
  programId?: number;
}

// Search and Filter
export interface SearchParams {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface StudentSearchParams extends SearchParams {
  classId?: number;
  programId?: number;
  departmentId?: number;
}

export interface CourseSearchParams extends SearchParams {
  departmentId?: number;
  creditsMin?: number;
  creditsMax?: number;
}

// File Upload
export interface FileUploadResponse {
  fileId: number;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
}

// Error Response
export interface ErrorResponse {
  code: number;
  message: string;
  details?: string;
  timestamp?: string;
  path?: string;
}

// Dashboard Data
export interface DashboardData {
  totalStudents: number;
  totalCourses: number;
  totalClasses: number;
  totalFaculties: number;
  recentActivities: ActivityLog[];
  notifications: NotificationSummary[];
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  description: string;
  timestamp: Date;
  userFullName: string;
}

export interface NotificationSummary {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

// Enrollment
export interface EnrollmentRequest {
  studentId: number;
  sectionId: number;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  studentId: number;
  sectionId: number;
  enrollmentStatus: number;
  registeredAt: Date;
}

// Grade Management
export interface GradeInput {
  studentId: number;
  assessmentId: number;
  score: number;
}

export interface GradeResponse {
  gradeId: number;
  studentId: number;
  assessmentId: number;
  score: number;
  studentName: string;
  assessmentTitle: string;
}

// Schedule
export interface ScheduleRequest {
  sectionId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
  room: string;
}

// Report Types
export interface GradeReport {
  studentId: number;
  studentName: string;
  mssv: string;
  className: string;
  grades: {
    courseCode: string;
    courseName: string;
    finalScore: number;
    gradeLetter: string;
    gradePoint: number;
  }[];
  gpa: number;
}

export interface ClassReport {
  classId: number;
  className: string;
  totalStudents: number;
  averageGpa: number;
  courses: {
    courseCode: string;
    courseName: string;
    averageScore: number;
    passRate: number;
  }[];
}

// Redux State Types
export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface RootState {
  user: UserState;
  theme: ThemeState;
}