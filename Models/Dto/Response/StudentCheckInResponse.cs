namespace StudentManagement.Models.Dto.Response
{
    public class StudentSelfCheckInResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();
        
        public int? AttendanceId { get; set; }
        public string? AttendanceStatus { get; set; }
        public DateTime? CheckInTime { get; set; }
        public string? SessionName { get; set; }
        public string? CourseName { get; set; }
    }

    public class AvailableCheckInSessionResponse
    {
        public int AttendanceSessionId { get; set; }
        public string SessionName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string SectionCode { get; set; } = string.Empty;
        public DateTime SessionDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Room { get; set; } = string.Empty;
        
        // Self check-in info
        public DateTime SelfCheckInStartTime { get; set; }
        public DateTime SelfCheckInEndTime { get; set; }

        
        // Current status
        public bool IsCheckInActive { get; set; }
        public bool HasCheckedIn { get; set; }
        public string? CurrentStatus { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public int MinutesUntilStart { get; set; }
        public int MinutesUntilEnd { get; set; }

        public bool RequireLocationVerification { get; set; }
        public double? ClassLatitude { get; set; }
        public double? ClassLongitude { get; set; }
        public int AllowedDistanceMeters { get; set; }

        public string LecturerName { get; set; } = string.Empty;
    }
}