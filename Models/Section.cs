namespace StudentManagement.Models
{
    public class Section
    {
        public int SectionId { get; set; }
        public Course Course { get; set; } = null!;
        public Semester Semester { get; set; } = null!;
        public Lecturer Lecturer { get; set; } = null!;
    }
}
