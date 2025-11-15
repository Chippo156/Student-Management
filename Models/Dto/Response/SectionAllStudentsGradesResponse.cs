namespace StudentManagement.Models.Dto.Response
{
    public class SectionAllStudentsGradesResponse
    {
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
        
        // Assessment structure (headers for the grade table)
        public List<AssessmentHeaderInfo> AssessmentHeaders { get; set; } = new();
        
        // All students with their grades
        public List<StudentGradesInSection> StudentGrades { get; set; } = new();
        
        // Statistics
        public int TotalStudents { get; set; }
        public int TotalAssessments { get; set; }
        public double OverallCompletionPercentage { get; set; }
        public int StudentsWithFinalGrades { get; set; }
        public int StudentsWithoutFinalGrades { get; set; }
    }

    public class AssessmentHeaderInfo
    {
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; } = string.Empty;
        public string AssessmentType { get; set; } = string.Empty;
        public int AssessmentTypeId { get; set; }
        public int Weight { get; set; }
        public bool IsRegularType { get; set; } // true nếu là điểm thường kỳ
    }

    public class StudentGradesInSection
    {
        // Student information
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string MSSV { get; set; } = string.Empty;
        
        // Enrollment status
        public string EnrollmentStatus { get; set; } = string.Empty;
        
        // Final results
        public double? FinalScore { get; set; }
        public string? GradeLetter { get; set; }
        
        // All assessment grades for this student (aligned with AssessmentHeaders)
        public List<AssessmentGradeData> AssessmentGrades { get; set; } = new();
        
        // Statistics for this student
        public int CompletedAssessments { get; set; }
        public int PendingAssessments { get; set; }
        public double CompletionPercentage { get; set; }
    }

    public class AssessmentGradeData
    {
        public int AssessmentId { get; set; }
        public int? GradeId { get; set; }
        public double? Score { get; set; }
        public bool HasGrade { get; set; }
        public bool CanEdit { get; set; }
    }
}