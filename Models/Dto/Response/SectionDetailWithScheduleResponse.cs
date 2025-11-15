namespace StudentManagement.Models.Dto.Response
{
    public class SectionDetailWithScheduleResponse
    {
        // Section information
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public int Credits { get; set; }
        
        // Class information
        public string ClassName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        
        // Semester information
        public string SemesterName { get; set; } = string.Empty;
        
        // Lecturer information
        public string LecturerName { get; set; } = string.Empty;
        
        // Section details
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int Capacity { get; set; }
        public int EnrolledCount { get; set; }
        
        // Schedule information (filtered by type)
        public List<ScheduleInfoSectionDetail> Schedules { get; set; } = new();
        
        // Practice group information (only for practice schedules)
        public PracticeGroupInfoWithSection? PracticeGroup { get; set; }
        
        // Student list (basic info only)
        public List<BasicStudentInfo> Students { get; set; } = new();
        
        // Statistics
        public int TotalStudents { get; set; }
        public int MaleStudents { get; set; }
        public int FemaleStudents { get; set; }
    }

    public class ScheduleInfoSectionDetail
    {
        public int ScheduleId { get; set; }
        public string ScheduleTypeName { get; set; } = string.Empty;
        public DayOfWeek? DayOfWeek { get; set; }
        public string DayOfWeekText { get; set; } = string.Empty;
        public DateOnly? Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string? OnlineLink { get; set; }
        public bool IsExam { get; set; }
    }

    public class PracticeGroupInfoWithSection
    {
        public int PracticeGroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxCapacity { get; set; }
        public int CurrentCount { get; set; }
        public string? PracticeLecturerName { get; set; }
    }

    public class BasicStudentInfo
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string? PracticeGroupName { get; set; } // Only for practice sections
    }
}