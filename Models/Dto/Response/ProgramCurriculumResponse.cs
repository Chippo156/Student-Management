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
        
        // **NEW: Student-specific information**
        public string? StudentMSSV { get; set; }
        public int StudentCompletedRequiredCredits { get; set; }
        public int StudentCompletedOptionalCredits { get; set; }
        public int StudentTotalCompletedCredits { get; set; }
        public double StudentCompletionRate { get; set; }
        public int StudentCompletedRequiredCourses { get; set; }
        public int StudentCompletedOptionalCourses { get; set; }
        
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
        
        // **NEW: Student progress for semester**
        public int StudentCompletedCredits { get; set; }
        public int StudentCompletedCourses { get; set; }
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
        
        // **NEW: Student progress for this course**
        public StudentCourseProgress? StudentProgress { get; set; }
    }

    // **NEW: Student course progress model**
    public class StudentCourseProgress
    {
        public int CourseId { get; set; }
        public bool HasTaken { get; set; }
        public bool IsCompleted { get; set; }
        public double? FinalScore { get; set; }
        public string? GradeLetter { get; set; }
        public double? GradePoint { get; set; }
        public string? SemesterTaken { get; set; }
        public string Status { get; set; } = string.Empty; // "Chưa học", "Đang học", "Đã đạt", "Chưa đạt"
        public int CreditsEarned { get; set; }
        public int AttemptCount { get; set; }
        public bool CanRetake { get; set; }
        public bool CanImprove { get; set; }
    }
}