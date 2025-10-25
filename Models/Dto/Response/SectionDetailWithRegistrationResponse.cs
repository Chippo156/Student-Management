namespace StudentManagement.Models.Dto.Response
{
    public class SectionDetailWithRegistrationResponse
    {
        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int CurrentEnrollment { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        
        // Course information
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public int TotalCredits { get; set; }
        
        // Lecturer information
        public string LecturerName { get; set; } = string.Empty;
        public string LecturerEmail { get; set; } = string.Empty;
        
        // Semester information
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        
        // Registration status
        public bool IsRegistrationOpen { get; set; }
        public DateTime? RegistrationStartDate { get; set; }
        public DateTime? RegistrationEndDate { get; set; }
        
        // Enrollment status
        public bool IsAvailable => CurrentEnrollment < MaxCapacity && IsRegistrationOpen;
        public int RemainingSlots => MaxCapacity - CurrentEnrollment;
    }

    public class SectionScheduleWithRegistrationResponse
    {
        public int SectionId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        
        // Registration status
        public bool IsRegistrationOpen { get; set; }
        public DateTime? RegistrationStartDate { get; set; }
        public DateTime? RegistrationEndDate { get; set; }
        
        public List<ScheduleDetailInfo> Schedules { get; set; } = new();
    }
    public class ScheduleDetailInfo
    {
        public int ScheduleId { get; set; }
        public string ScheduleTypeName { get; set; } = string.Empty;
        public DayOfWeek? DayOfWeek { get; set; }
        public string DayOfWeekName { get; set; } = string.Empty;
        public DateOnly? Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Room { get; set; } = string.Empty;
        public string? OnlineLink { get; set; }
        public bool IsRecurring => !Date.HasValue && DayOfWeek.HasValue;
        public bool IsOneTime => Date.HasValue;
    }
}