// Database Types based on StudentManagement SQL Schema

export interface User {
  userId: number;
  username: string;
  fullName: string;
  passwordHash: string;
  email: string;
  phone: string;
  accountStatus: AccountStatus;
  refreshToken: string;
  refreshTokenExpiryTime: Date;
  createdAt: Date;
  roleId: number;
  address: string;
  avatarUrl: string;
  gender: Gender;
  role?: Role;
}

export interface Role {
  roleId: number;
  roleName: string;
  description: string;
  permissions?: Permission[];
}

export interface Permission {
  permissionId: number;
  permissionName: string;
  description: string;
}

export interface Student {
  id: number;
  userId: number;
  mssv: string;
  classId: number;
  user?: User;
  class?: Class;
}

export interface Lecturer {
  id: number;
  userId: number;
  departmentId: number;
  position: string;
  academicTitle: string;
  user?: User;
  department?: Department;
}

export interface Faculty {
  facultyId: number;
  facultyName: string;
  description: string;
  departments?: Department[];
}

export interface Department {
  departmentId: number;
  departmentName: string;
  facultyId: number;
  faculty?: Faculty;
  programs?: Program[];
  lecturers?: Lecturer[];
}

export interface Program {
  programId: number;
  programName: string;
  degreeLevel: string;
  departmentId: number;
  department?: Department;
  classes?: Class[];
  curriculumCourses?: CurriculumCourse[];
}

export interface Class {
  classId: number;
  className: string;
  programId: number;
  program?: Program;
  students?: Student[];
}

export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  creditsTheory: number;
  creditsLab: number;
  sections?: Section[];
  curriculumCourses?: CurriculumCourse[];
  prerequisites?: Prerequisite[];
}

export interface CurriculumCourse {
  id: number;
  programId: number;
  courseId: number;
  isRequired: boolean;
  semesterSuggested: number;
  program?: Program;
  course?: Course;
}

export interface Section {
  sectionId: number;
  courseId: number;
  semester: string;
  lecturerId: number;
  course?: Course;
  lecturer?: Lecturer;
  assessments?: Assessment[];
  enrollments?: Enrollment[];
  schedules?: Schedule[];
  finalResults?: FinalResult[];
}

export interface Assessment {
  assessmentId: number;
  sectionId: number;
  title: string;
  weight: number;
  section?: Section;
  grades?: Grade[];
}

export interface Grade {
  gradeId: number;
  assessmentId: number;
  score: number;
  studentId: number;
  assessment?: Assessment;
  student?: Student;
}

export interface FinalResult {
  finalResultId: number;
  sectionId: number;
  studentId: number;
  finalScore: number;
  gradeLetter: string;
  gradePoint: number;
  section?: Section;
  student?: Student;
}

export interface Enrollment {
  enrollmentId: number;
  studentId: number;
  sectionId: number;
  enrollmentStatus: EnrollmentStatus;
  registeredAt: Date;
  student?: Student;
  section?: Section;
}

export interface Schedule {
  scheduleId: number;
  sectionId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
  room: string;
  section?: Section;
}

export interface Semester {
  semesterId: number;
  year: number;
  term: string;
  gpaSnapshots?: GpaSnapshot[];
}

export interface GpaSnapshot {
  gpaSnapshotId: number;
  studentId: number;
  gpa: number;
  semesterId: number;
  student?: Student;
  semester?: Semester;
}

export interface Announcement {
  announcementId: number;
  title: string;
  content: string;
  createdAt: Date;
  createdByUserId: number;
  createdByUser?: User;
  notifications?: Notification[];
}

export interface Notification {
  notificationId: number;
  announcementId: number;
  userId: number;
  status: NotificationStatus;
  sentAt: Date;
  announcement?: Announcement;
  user?: User;
}

export interface DocumentType {
  documentTypeId: number;
  name: string;
  templatePath: string;
  documentRequests?: DocumentRequest[];
}

export interface DocumentRequest {
  documentRequestId: number;
  studentId: number;
  documentTypeId: number;
  requestDate: Date;
  status: DocumentRequestStatus;
  student?: Student;
  documentType?: DocumentType;
  generatedDocuments?: GeneratedDocument[];
}

export interface GeneratedDocument {
  id: number;
  documentRequestId: number;
  filePath: string;
  createdAt: Date;
  documentRequest?: DocumentRequest;
}

export interface File {
  fileId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedByUserId: number;
  uploadedAt: Date;
  uploadedByUser?: User;
}

export interface Prerequisite {
  id: number;
  courseId: number;
  prerequisiteCourseId: number;
  course?: Course;
  prerequisiteCourse?: Course;
}

export interface AdviserAssignment {
  id: number;
  lecturerId: number;
  classId: number;
  startDate: Date;
  endDate?: Date;
  lecturer?: Lecturer;
  class?: Class;
}

// Enums
export enum AccountStatus {
  Inactive = 0,
  Active = 1,
  Suspended = 2,
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

export enum EnrollmentStatus {
  Enrolled = 0,
  Dropped = 1,
  Completed = 2,
}

export enum NotificationStatus {
  Unread = 0,
  Read = 1,
}

export enum DocumentRequestStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Rejected = 3,
}

// Database table info for management
export interface TableInfo {
  name: string;
  displayName: string;
  fields: FieldInfo[];
  primaryKey: string;
  foreignKeys?: ForeignKeyInfo[];
}

export interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  maxLength?: number;
  description?: string;
}

export interface ForeignKeyInfo {
  field: string;
  referencedTable: string;
  referencedField: string;
}

export const DATABASE_SCHEMA: TableInfo[] = [
  {
    name: 'Users',
    displayName: 'Người dùng',
    primaryKey: 'userId',
    fields: [
      { name: 'userId', type: 'int', required: true, isPrimaryKey: true },
      { name: 'username', type: 'nvarchar', required: true },
      { name: 'fullName', type: 'nvarchar', required: true },
      { name: 'passwordHash', type: 'nvarchar', required: true },
      { name: 'email', type: 'nvarchar', required: true },
      { name: 'phone', type: 'nvarchar', required: true },
      { name: 'accountStatus', type: 'int', required: true },
      { name: 'refreshToken', type: 'nvarchar', required: true },
      { name: 'refreshTokenExpiryTime', type: 'datetime2', required: true },
      { name: 'createdAt', type: 'datetime2', required: true },
      { name: 'roleId', type: 'int', required: true, isForeignKey: true },
      { name: 'address', type: 'nvarchar', required: true },
      { name: 'avatarUrl', type: 'nvarchar', required: true },
      { name: 'gender', type: 'int', required: true },
    ],
    foreignKeys: [
      { field: 'roleId', referencedTable: 'Roles', referencedField: 'roleId' },
    ],
  },
  {
    name: 'Students',
    displayName: 'Sinh viên',
    primaryKey: 'id',
    fields: [
      { name: 'id', type: 'int', required: true, isPrimaryKey: true },
      { name: 'userId', type: 'int', required: true, isForeignKey: true },
      { name: 'mssv', type: 'nvarchar', required: true },
      { name: 'classId', type: 'int', required: true, isForeignKey: true },
    ],
    foreignKeys: [
      { field: 'userId', referencedTable: 'Users', referencedField: 'userId' },
      {
        field: 'classId',
        referencedTable: 'Classes',
        referencedField: 'classId',
      },
    ],
  },
  {
    name: 'Courses',
    displayName: 'Môn học',
    primaryKey: 'courseId',
    fields: [
      { name: 'courseId', type: 'int', required: true, isPrimaryKey: true },
      { name: 'courseCode', type: 'nvarchar', required: true },
      { name: 'courseName', type: 'nvarchar', required: true },
      { name: 'creditsTheory', type: 'int', required: true },
      { name: 'creditsLab', type: 'int', required: true },
    ],
  },
  {
    name: 'Classes',
    displayName: 'Lớp học',
    primaryKey: 'classId',
    fields: [
      { name: 'classId', type: 'int', required: true, isPrimaryKey: true },
      { name: 'className', type: 'nvarchar', required: true },
      { name: 'programId', type: 'int', required: true, isForeignKey: true },
    ],
    foreignKeys: [
      {
        field: 'programId',
        referencedTable: 'Program',
        referencedField: 'programId',
      },
    ],
  },
  // Add more tables as needed
];
