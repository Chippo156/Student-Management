using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class AttendanceSessionResponse
    {
        public int AttendanceSessionId { get; set; }
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Room { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedByLecturerName { get; set; } = string.Empty;
        
        // Practice group info (if applicable)
        public int? PracticeGroupId { get; set; }
        public string? PracticeGroupName { get; set; }
        public DateTime? SelfCheckInStartTime { get; set; }
        public DateTime? SelfCheckInEndTime { get; set; }
        public string? CheckInCode { get; set; } // 6-digit code for verification

        // Attendance statistics
        public int TotalStudents { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public double AttendanceRate { get; set; }
        
        public List<AttendanceRecordResponse> AttendanceRecords { get; set; } = new();
    }

    public class AttendanceRecordResponse
    {
        public int AttendanceId { get; set; }
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public AttendanceStatus Status { get; set; }
        public string StatusVietnamese { get; set; } = string.Empty;
        public DateTime RecordedAt { get; set; }
        public string? Note { get; set; }
        public string RecordedByLecturerName { get; set; } = string.Empty;
    }

    public class StudentAttendanceStatisticsResponse
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        
        // Attendance statistics
        public int TotalSessions { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int ExcusedCount { get; set; }
        public double AttendanceRate { get; set; }
        
        // Detailed records
        public List<StudentAttendanceRecord> AttendanceRecords { get; set; } = new();
    }

    public class StudentAttendanceRecord
    {
        public int AttendanceSessionId { get; set; }
        public DateTime SessionDate { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public AttendanceStatus Status { get; set; }
        public string StatusVietnamese { get; set; } = string.Empty;
        public string? Note { get; set; }
    }
}