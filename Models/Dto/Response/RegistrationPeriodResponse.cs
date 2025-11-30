namespace StudentManagement.Models.Dto.Response
{
    public class RegistrationPeriodResponse
    {
        public int RegistrationPeriodId { get; set; }
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int SemesterYear { get; set; }
        public string SemesterTerm { get; set; } = string.Empty;
        
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        
        // Additional info
        public string Status { get; set; } = string.Empty;
        public int DaysRemaining { get; set; }
        public bool HasStarted { get; set; }
        public bool HasEnded { get; set; }
        public string Duration { get; set; } = string.Empty;
    }

    public class RegistrationPeriodDetailResponse : RegistrationPeriodResponse
    {
        public int TotalSections { get; set; }
        public int TotalEnrollments { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Statistics
        public List<SectionRegistrationStats> SectionStats { get; set; } = new();
    }

    public class SectionRegistrationStats
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int EnrolledCount { get; set; }
        public int Capacity { get; set; }
        public double FillRate { get; set; }
    }
}