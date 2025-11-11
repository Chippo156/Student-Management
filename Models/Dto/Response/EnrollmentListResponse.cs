namespace StudentManagement.Models.Dto.Response
{
    public class EnrollmentListResponse
    {
        public int EnrollmentId { get; set; }
        
        // Student information
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ProgramName { get; set; } = string.Empty;
        
        // Section information
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        
        // Course information
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public int TotalCredits { get; set; }
        
        // Lecturer information
        public string LecturerName { get; set; } = string.Empty;
        public string LecturerCode { get; set; } = string.Empty;
        
        // Semester information
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        
        // Enrollment information
        public string EnrollmentStatus { get; set; } = string.Empty;
        public string EnrollmentStatusVietnamese { get; set; } = string.Empty;
        public DateTime RegisteredAt { get; set; }
        
        // Additional section information
        public int SectionCapacity { get; set; }
        public int SectionEnrolledCount { get; set; }
        public DateOnly SectionStartDate { get; set; }
        public DateOnly SectionEndDate { get; set; }
    }
}