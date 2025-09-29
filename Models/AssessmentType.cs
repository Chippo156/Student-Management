namespace StudentManagement.Models
{
    public class AssessmentType
    {
        public int AssessmentTypeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public double DefaultWeight { get; set; }
    }
}
