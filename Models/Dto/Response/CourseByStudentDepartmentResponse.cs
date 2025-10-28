using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class CourseByStudentDepartmentResponse
    {
        public int CurriculumCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public int TotalCredits { get; set; }
        
        // Department info
        public string DepartmentName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        
        // Curriculum Course info
        public bool IsRequired { get; set; }
        public int SemesterSuggested { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        
        // Course status
        public CourseFilterType CourseStatus { get; set; }
        public string? PreviousGradeLetter { get; set; }
        public double? PreviousFinalScore { get; set; }
        public bool HasPreviousResult { get; set; }

        // Thêm các properties này vào CourseByStudentDepartmentResponse
        public bool CanRegister { get; set; }
        public int AvailableSectionsCount { get; set; }
        public string RegistrationNote { get; set; } = string.Empty;

        // Prerequisites
        public List<PrerequisiteCourseInfo> Prerequisites { get; set; } = new();
    }

    public class PrerequisiteCourseInfo
    {
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int TotalCredits { get; set; }
        public bool IsCompleted { get; set; }
    }
}