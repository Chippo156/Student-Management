namespace StudentManagement.Models
{
    public class Assessment
    {
        public int AssessmentId { get; set; }
        public Section Section { get; set; } = null!;
        public String Title { get; set; } = string.Empty;
        public int Weight { get; set; }
    }
}
