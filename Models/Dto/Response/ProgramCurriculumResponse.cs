namespace StudentManagement.Models.Dto.Response
{
    public class ProgramCurriculumResponse
    {
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        public int TotalCreditsRequired { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        
        // Summary statistics
        public int TotalRequiredCredits { get; set; }
        public int TotalOptionalCredits { get; set; }
        public int RequiredCourseCount { get; set; }
        public int OptionalCourseCount { get; set; }
        
        // Courses grouped by semester
        public List<SemesterCurriculumDetail> SemesterCourses { get; set; } = new();
        
        // Courses grouped by type
        public List<CurriculumCourseDetail> RequiredCourses { get; set; } = new();
        public List<CurriculumCourseDetail> OptionalCourses { get; set; } = new();
    }

    public class SemesterCurriculumDetail
    {
        public int SemesterNumber { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int TotalCredits { get; set; }
        public int RequiredCredits { get; set; }
        public int OptionalCredits { get; set; }
        public List<CurriculumCourseDetail> Courses { get; set; } = new();
    }

    public class CurriculumCourseDetail
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
        public string CourseType => IsRequired ? "Bắt buộc" : "Tự chọn";
        
        // Prerequisites information
        public List<PrerequisiteCourseInfo> Prerequisites { get; set; } = new();
    }
}