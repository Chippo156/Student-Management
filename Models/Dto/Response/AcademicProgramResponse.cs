namespace StudentManagement.Models.Dto.Response
{
    public class AcademicProgramResponse
    {
        public int AcademicProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        public int CreditsRequired { get; set; }
        
        // Department information
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int FacultyId { get; set; }
        public string FacultyName { get; set; } = string.Empty;
        
        // Statistics
        public int StudentCount { get; set; }
        public int CourseCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}