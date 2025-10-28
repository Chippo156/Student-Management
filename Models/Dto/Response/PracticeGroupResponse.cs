namespace StudentManagement.Models.Dto.Response
{
    public class PracticeGroupResponse
    {
        public int PracticeGroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxCapacity { get; set; }
        public int CurrentCount { get; set; }
        public bool IsActive { get; set; }
        
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        
        public List<PracticeScheduleInfo> Schedules { get; set; } = new List<PracticeScheduleInfo>();
        public List<StudentInfo> Students { get; set; } = new List<StudentInfo>();
        
        public DateTime CreatedAt { get; set; }
    }


    public class StudentInfo
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
    }
}