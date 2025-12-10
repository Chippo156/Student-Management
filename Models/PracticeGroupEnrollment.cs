namespace StudentManagement.Models
{
    public class PracticeGroupEnrollment
    {
        public int PracticeGroupEnrollmentId { get; set; }
        
        public int PracticeGroupId { get; set; }
        public PracticeGroup PracticeGroup { get; set; } = null!;
        
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;
        
        public DateTime EnrolledAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
    }
}