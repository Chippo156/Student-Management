namespace StudentManagement.Models
{
    public class Assessment
    {
        public int AssessmentId { get; set; }
        public AssessmentType AssessmentType { get; set; } = null!;
        public Section Section { get; set; } = null!;
        public String Title { get; set; } = string.Empty;
        public int Weight { get; set; }
    }
}
