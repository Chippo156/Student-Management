namespace StudentManagement.Models
{
    public class FinalResult
    {
        public int FinalResultId { get; set; }
        public Section Section { get; set; } = null!;
        public Student Student { get; set; } = null!;
        public Double FinalScore { get; set; }
        public string GradeLetter { get; set; } = string.Empty;
        public Double GradePoint { get; set; }
    }
}
