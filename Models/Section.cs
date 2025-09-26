namespace StudentManagement.Models
{
    public class Section
    {
        public int SectionId { get; set; }
        public Course Course { get; set; } = null!;
        public string Semester { get; set; } = string.Empty;
        public Lecturer Lecturer { get; set; } = null!;
    }
}
