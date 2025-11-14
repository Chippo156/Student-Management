namespace StudentManagement.Models.Dto.Request
{
    public class BulkGradeRequest
    {
        public int AssessmentId { get; set; }
        public List<StudentGradeEntry> StudentGrades { get; set; } = new();
    }

    public class StudentGradeEntry
    {
        public int StudentId { get; set; }
        public double Score { get; set; }
        public string? Note { get; set; }
    }
}