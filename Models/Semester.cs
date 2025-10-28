namespace StudentManagement.Models
{
    public class Semester
    {
        public int SemesterId { get; set; }
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty; // e.g., "Fall", "Spring", "Summer"
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }
}