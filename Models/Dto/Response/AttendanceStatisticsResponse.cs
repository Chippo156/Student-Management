namespace StudentManagement.Models.Dto.Response
{
    public class SectionAttendanceStatisticsResponse
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string SemesterName { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
        
        public int TotalStudents { get; set; }
        public int TotalSessions { get; set; }
        public double OverallAttendanceRate { get; set; }
        
        public List<StudentAttendanceStats> StudentStats { get; set; } = new();
        public List<SessionAttendanceStats> SessionStats { get; set; } = new();
        public AttendanceStatusSummary AttendanceSummary { get; set; } = new();
    }

    public class StudentAttendanceStats
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        
        public int TotalSessions { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public int LeftEarlyCount { get; set; }
        
        public double AttendanceRate { get; set; }
        public double PresentRate { get; set; }
        public string AttendanceStatus { get; set; } = string.Empty; // Good, Warning, Poor
        
        public List<AttendanceDetail> AttendanceDetails { get; set; } = new();
    }

    public class AttendanceDetail
    {
        public DateTime AttendanceDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string StatusText { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class SessionAttendanceStats
    {
        public DateTime SessionDate { get; set; }
        public int SessionNumber { get; set; }
        public string? Topic { get; set; }
        
        public int TotalStudents { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public int LeftEarlyCount { get; set; }
        
        public double AttendanceRate { get; set; }
    }

    public class AttendanceStatusSummary
    {
        public int TotalPresentRecords { get; set; }
        public int TotalAbsentRecords { get; set; }
        public int TotalLateRecords { get; set; }
        public int TotalExcusedRecords { get; set; }
        public int TotalLeftEarlyRecords { get; set; }
        
        public double PresentPercentage { get; set; }
        public double AbsentPercentage { get; set; }
        public double LatePercentage { get; set; }
        public double ExcusedPercentage { get; set; }
        public double LeftEarlyPercentage { get; set; }
    }
}