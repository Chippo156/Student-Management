namespace StudentManagement.Models
{
    public class Grade
    {
        public int GradeId { get; set; }
        public Assessment Assessment { get; set; } = null!;
        public Double Score { get; set; } = 0;
        public Student Student { get; set; } = null!;
    }
}
