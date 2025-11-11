namespace StudentManagement.Models.Dto.Response
{
    public class ClassResponse
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        
        // Program information
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        
        // Department information
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        
        // Adviser information
        public int? AdviserId { get; set; }
        public string AdviserName { get; set; } = string.Empty;
        public string AdviserCode { get; set; } = string.Empty;
        
        // Statistics
        public int StudentCount { get; set; }
        public int RequiredCredits { get; set; }
    }
}