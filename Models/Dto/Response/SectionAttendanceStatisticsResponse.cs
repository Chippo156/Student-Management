namespace StudentManagement.Models.Dto.Response
{
    public class SectionAllAttendanceStatisticsResponse
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string SemesterName { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
        
        // Thông tin tổng quan
        public int TotalStudents { get; set; }
        public int TotalSessions { get; set; }
        public double OverallAttendanceRate { get; set; }
        
        // Thống kê chi tiết từng sinh viên
        public List<StudentAttendanceDetail> StudentAttendanceDetails { get; set; } = new();
        
        // Thống kê theo buổi học
        public List<SessionAttendanceDetail> SessionAttendanceDetails { get; set; } = new();
        
        // Tổng hợp trạng thái điểm danh
        public AttendanceStatusSummary AttendanceSummary { get; set; } = new();
    }

    public class StudentAttendanceDetail
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        
        // Thống kê điểm danh
        public int TotalSessions { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public int LeftEarlyCount { get; set; }
        
        public double AttendanceRate { get; set; }
        public double PresentRate { get; set; }
        public string AttendanceLevel { get; set; } = string.Empty; // Excellent, Good, Average, Warning, Poor
        
        // Chi tiết từng buổi học
        public List<StudentSessionDetail> SessionDetails { get; set; } = new();
    }

    public class StudentSessionDetail
    {
        public int AttendanceSessionId { get; set; }
        public DateTime SessionDate { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusVietnamese { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class SessionAttendanceDetail
    {
        public int AttendanceSessionId { get; set; }
        public DateTime SessionDate { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public int SessionNumber { get; set; }
        
        public int TotalStudents { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public int LeftEarlyCount { get; set; }
        
        public double AttendanceRate { get; set; }
    }

    public class AttendanceAllStudentStatusSummary
    {
        public int TotalPresentRecords { get; set; }
        public int TotalAbsentRecords { get; set; }
        public int TotalLateRecords { get; set; }
        public int TotalExcusedRecords { get; set; }
        public int TotalLeftEarlyRecords { get; set; }
    }
}