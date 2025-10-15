namespace StudentManagement.Models.Dto.Response
{
    public class StudentAcademicSummaryResponse
    {
        // Academic information
        public double GPA { get; set; }
        public int CompletedCredits { get; set; }
        public int FailedCredits { get; set; }
        public double CompletionRate { get; set; }  // Percentage of required credits completed
        
        // Failed courses
        public List<FailedCourseInfo> FailedCourses { get; set; } = new();
        
        // Per semester breakdown (only if requesting all semesters)
        public List<SemesterSummary> SemesterSummaries { get; set; } = new();
    }

    public class SemesterSummary
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public double SemesterGPA { get; set; }
        public int CompletedCredits { get; set; }
        public int FailedCredits { get; set; }
    }

    public class FailedCourseInfo
    {
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string GradeLetter { get; set; } = string.Empty;
        public double FinalScore { get; set; }
    }
}