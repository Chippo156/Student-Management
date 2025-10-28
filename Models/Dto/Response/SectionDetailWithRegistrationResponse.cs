using StudentManagement.Enum;

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

        // Class information
        public string ClassName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;

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
        public SectionStatus Status { get; set; }   

        // Enrollment status
        public bool IsAvailable => CurrentEnrollment < MaxCapacity && IsRegistrationOpen;
        public int RemainingSlots => MaxCapacity - CurrentEnrollment;
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
        public string? PracticeGroupName { get; set; }
        public bool IsPracticeSchedule => !string.IsNullOrEmpty(PracticeGroupName);
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

        // Course information
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public bool HasPracticeGroups { get; set; }

        public List<ScheduleDetailInfo> Schedules { get; set; } = new List<ScheduleDetailInfo>();
        public List<PracticeGroupInfo> PracticeGroups { get; set; } = new List<PracticeGroupInfo>();
        public StudentPracticeGroupInfo? StudentCurrentPracticeGroup { get; set; }
    }

    public class PracticeGroupInfo
    {
        public int PracticeGroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int CurrentCount { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsStudentEnrolled { get; set; }
        public List<PracticeScheduleInfo> Schedules { get; set; } = new List<PracticeScheduleInfo>();
    }

    public class StudentPracticeGroupInfo
    {
        public int PracticeGroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class PracticeScheduleInfo
    {
        public int ScheduleId { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public DateOnly? Date { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string ScheduleType { get; set; } = string.Empty;
    }
}