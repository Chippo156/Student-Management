namespace StudentManagement.Models.Dto.Response
{
    public class StudentSectionAllGradesResponse
    {
        // Student information
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string MSSV { get; set; } = string.Empty;
        
        // Section information
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int Credits { get; set; }
        
        // Semester information
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        
        // Lecturer information
        public string LecturerName { get; set; } = string.Empty;
        
        // Final results
        public double? FinalScore { get; set; }
        public string? GradeLetter { get; set; }
        
        // Enrollment status
        public string EnrollmentStatus { get; set; } = string.Empty;

        // Assessment grades (both existing and missing)
        public List<AssessmentGradeInfo> AssessmentDetails { get; set; } = new();

        // Statistics
        public int TotalAssessments { get; set; }
        public int CompletedAssessments { get; set; }
        public int PendingAssessments { get; set; }
        public double CompletionPercentage { get; set; }
    }

    public class AssessmentTypeGrades
    {        
        // Chi tiết các assessment trong type này
        public List<AssessmentGradeInfo> AssessmentDetails { get; set; } = new();
    }

    public class AssessmentGradeInfo
    {
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; } = string.Empty;
        public int Weight { get; set; }
        
        // Grade information (nullable if not exists)
        public int? GradeId { get; set; }
        public double? Score { get; set; }
        
        // Status flags
        public bool HasGrade { get; set; }
        public bool CanInputGrade { get; set; }
    }
}