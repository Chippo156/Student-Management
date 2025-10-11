namespace StudentManagement.Models.Dto.Response
{
    public class StudentSectionGradesResponse
    {
        public int SectionId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public List<AssessmentGradeDetail> Grades { get; set; } = new();
        public double? FinalScore { get; set; }
        public string? GradeLetter { get; set; }
    }

    public class AssessmentGradeDetail
    {
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; } = string.Empty;
        public string AssessmentType { get; set; } = string.Empty;
        public double Weight { get; set; }
        public double Score { get; set; }
    }
}