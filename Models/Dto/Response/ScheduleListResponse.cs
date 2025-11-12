namespace StudentManagement.Models.Dto.Response
{
    public class ScheduleListResponse
    {
        public int ScheduleId { get; set; }
        public string ScheduleType { get; set; } = string.Empty;
        public int ScheduleTypeId { get; set; }
        
        // Section information
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        
        // Course information
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        
        // Lecturer information
        public int? LecturerId { get; set; }
        public string LecturerName { get; set; } = string.Empty;
        
        // Class information
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        
        // Semester information
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        
        // Schedule details
        public DayOfWeek? DayOfWeek { get; set; }
        public string DayOfWeekText { get; set; } = string.Empty;
        public DateOnly? Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string? OnlineLink { get; set; }
        
        // Practice Group information
        public bool IsPracticeGroup { get; set; }
        public int? PracticeGroupId { get; set; }
        public string PracticeGroupName { get; set; } = string.Empty;
        public int ? PracticeGroupCapacity { get; set; }
        // Additional info
        public bool IsRecurring { get; set; }
        public bool IsExam { get; set; }
    }
}