namespace StudentManagement.Models.Dto.Response
{
    public class StudentAllGradesResponse
    {
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public List<SemesterGradesDetail> SemesterGrades { get; set; } = new();
    }

    public class SemesterGradesDetail
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;

        // Điểm trung bình học kỳ
        public double SemesterGPA10 { get; set; }
        public double SemesterGPA4 { get; set; }

        // Điểm trung bình tích lũy
        public double CumulativeGPA10 { get; set; }
        public double CumulativeGPA4 { get; set; }

        // Tín chỉ
        public int TotalCreditsRegistered { get; set; }     // Tổng số tín chỉ đã đăng ký
        public int TotalCreditsEarned { get; set; }         // Tổng số tín chỉ đạt
        public int TotalCreditsDebt { get; set; }           // Tổng số tín chỉ nợ tính đến hiện tại

        // Xếp loại học lực
        public string SemesterRank { get; set; } = string.Empty;   // Xếp loại học lực học kỳ
        public string CumulativeRank { get; set; } = string.Empty; // Xếp loại học lực tích lũy

        // Danh sách môn học và điểm chi tiết
        public List<CourseGradesDetail> CourseGrades { get; set; } = new();
    }


    public class CourseGradesDetail
    {
        public int SectionId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public double? FinalScore { get; set; }
        public string? GradeLetter { get; set; }
        
        // All assessment types for this course (including Assessment Type 1)
        public List<CourseAssessmentGrade> Assessments { get; set; } = new();
    }

    public class CourseAssessmentGrade
    {
        public int GradeId { get; set; }
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; } = string.Empty;
        public string AssessmentType { get; set; } = string.Empty;
        public int AssessmentTypeId { get; set; }
        public double Score { get; set; }
        
        // For Assessment Type 1, this will contain the list of individual scores
        public List<RegularPointsDetail>? RegularPointsDetails { get; set; }
    }

    public class RegularPointsDetail
    {
        public int GradeId { get; set; }
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; } = string.Empty;
        public double Score { get; set; }
    }
}