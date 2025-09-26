using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class Enrollment
    {
        public int EnrollmentId { get; set; }
        public Student Student { get; set; } = null!;
        public Section Section { get; set; } = null!;
        public EnrollmentStatus enrollmentStatus { get; set; }
        public DateTime RegisteredAt { get; set; }
    }
}
