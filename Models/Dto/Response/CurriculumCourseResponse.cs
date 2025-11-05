namespace StudentManagement.Models.Dto.Response
{
    public class CurriculumCourseResponse
    {
        public int CurriculumCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public int TotalCredits { get; set; }
        public bool IsRequired { get; set; }
        public int SemesterSuggested { get; set; }
        public string CourseType { get; set; } = string.Empty;
        
        // Program information
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        
        // Department information
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        
        // Prerequisites
        public List<PrerequisiteCourseInfo> Prerequisites { get; set; } = new();
    }
}