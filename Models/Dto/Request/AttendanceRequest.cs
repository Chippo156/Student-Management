using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Request
{
    public class CreateAttendanceSessionRequest
    {
        public int SectionId { get; set; }
        public DateTime SessionDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Room { get; set; }
        public int? PracticeGroupId { get; set; } // Null for main class, specific for practice group
        public bool AllowSelfCheckIn { get; set; } = false;
        public DateTime? SelfCheckInStartTime { get; set; }
        public DateTime? SelfCheckInEndTime { get; set; }
    }

    public class RecordAttendanceRequest
    {
        public int AttendanceSessionId { get; set; }
        public List<StudentAttendanceRecord> StudentAttendances { get; set; } = new();
    }

    public class StudentAttendanceRecord
    {
        public int StudentId { get; set; }
        public AttendanceStatus Status { get; set; }
        public string? Note { get; set; }
    }

    public class UpdateAttendanceRequest
    {
        public AttendanceStatus Status { get; set; }
        public string? Note { get; set; }
    }
}