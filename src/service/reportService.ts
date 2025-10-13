import axios from "../until/customize-axios";

export interface SemesterCourse {
  courseId: number;
  courseCode: string;
  courseName: string;
  creditsTheory: number;
  creditsLab: number;
  totalCredits: number;
  gradeLetter: string;
  gradePoint: number;
  classAverageScore: number;
}

export interface SemesterCreditsData {
  semesterName: string;
  year: number;
  term: string;
  creditsRegistered: number;
  creditsCompleted: number;
  creditsPassed: number;
  semesterGPA: number;
  courses: SemesterCourse[];
}

export interface SemesterCreditsResponse {
  success: boolean;
  code: number;
  message: string;
  data: SemesterCreditsData;
}

const reportService = {
  getSemesterCredits: async (semesterId: string): Promise<SemesterCreditsResponse> => {
    const res = await axios.get(`/api/Report/semester/${semesterId}/credits`);
    if (!res.success) {
      // Có thể dùng message.error nếu dùng Ant Design
      throw new Error(res.message || "Không lấy được dữ liệu học kỳ");
    }
    return res.data;
  },
};

export default reportService;