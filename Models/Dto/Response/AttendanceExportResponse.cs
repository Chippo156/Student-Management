namespace StudentManagement.Models.Dto.Response
{
    public class SectionAttendanceExportResponse
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string SemesterName { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
        public DateTime ExportedAt { get; set; }
        
        // Thông tin tổng quan
        public int TotalStudents { get; set; }
        public int TotalSessions { get; set; }
        public double OverallAttendanceRate { get; set; }
        
        // Headers cho các buổi học
        public List<AttendanceSessionHeader> SessionHeaders { get; set; } = new();
        
        // Danh sách sinh viên và điểm danh tương ứng
        public List<StudentAttendanceRow> StudentRows { get; set; } = new();
        
        // Thống kê tổng hợp
        public List<SessionStatisticsSummary> SessionSummaries { get; set; } = new();
    }

    public class AttendanceSessionHeader
    {
        public int AttendanceSessionId { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public int SessionNumber { get; set; }
        public string SessionDateFormatted => SessionDate.ToString("dd/MM/yyyy");
        public string SessionInfo => $"Buổi {SessionNumber} ({SessionDateFormatted})";
    }

    public class StudentAttendanceRow
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        
        // Ma trận điểm danh: Key = AttendanceSessionId, Value = Attendance Status
        public Dictionary<int, AttendanceCell> AttendanceMatrix { get; set; } = new();
        
        // Thống kê tổng của sinh viên
        public int TotalPresent { get; set; }
        public int TotalAbsent { get; set; }
        public int TotalLate { get; set; }
        public int TotalExcused { get; set; }
        public double AttendanceRate { get; set; }
        public string AttendanceLevel { get; set; } = string.Empty;
    }

    public class AttendanceCell
    {
        public string Status { get; set; } = string.Empty; // Present, Absent, Late, Excused, Left, Unknown
        public string StatusSymbol { get; set; } = string.Empty; // P, A, L, E, X, ?
        public string StatusVietnamese { get; set; } = string.Empty;
        public string? Note { get; set; }
        public bool HasNote => !string.IsNullOrEmpty(Note);
        public string CellColor { get; set; } = string.Empty; // For Excel/UI coloring
    }

    public class SessionStatisticsSummary
    {
        public int AttendanceSessionId { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public int SessionNumber { get; set; }
        
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public int LeftEarlyCount { get; set; }
        public int UnknownCount { get; set; }
        
        public double AttendanceRate { get; set; }
        public double PresentPercentage { get; set; }
        public double AbsentPercentage { get; set; }
    }
}