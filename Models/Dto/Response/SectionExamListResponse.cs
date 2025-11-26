namespace StudentManagement.Models.Dto.Response
{
    public class SectionExamListResponse
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string SemesterName { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
        
        // Thông tin lịch thi
        public ExamScheduleInfo? ExamSchedule { get; set; }
        
        // Danh sách sinh viên dự thi
        public List<StudentExamInfo> Students { get; set; } = new();
        
        // Thống kê
        public int TotalStudents { get; set; }
        public int EligibleStudents { get; set; }
        public int IneligibleStudents { get; set; }
        
        public DateTime GeneratedAt { get; set; }
    }

    public class ExamScheduleInfo
    {
        public int ScheduleId { get; set; }
        public DateTime ExamDate { get; set; }
        public string ExamDateFormatted => ExamDate.ToString("dd/MM/yyyy");
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string TimeSlot => $"{StartTime:HH:mm} - {EndTime:HH:mm}";
        public string Room { get; set; } = string.Empty;
        public string? OnlineLink { get; set; }
        public string ScheduleTypeName { get; set; } = string.Empty;
    }

    public class StudentExamInfo
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        
        // Trạng thái dự thi
        public bool IsEligible { get; set; }
        public string EligibilityReason { get; set; } = string.Empty;
        
        // Thông tin học tập
        public bool HasPaidTuition { get; set; }
        public string EnrollmentStatus { get; set; } = string.Empty;
        
        // Thông tin điểm số hiện tại (nếu có)
        public List<GradeInfo> CurrentGrades { get; set; } = new();        
    }

    public class GradeInfo
    {
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; } = string.Empty;
        public string AssessmentType { get; set; } = string.Empty;
        public double Score { get; set; }
        public int Weight { get; set; }
    }
}