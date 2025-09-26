namespace StudentManagement.Models
{
    public class GpaSnapshot
    {
        public int GpaSnapshotId { get; set; }
        public Student Student { get; set; } = null!;
        public Double Gpa { get; set; }
        public Semester Semester { get; set; } = null!; 
    }
}
