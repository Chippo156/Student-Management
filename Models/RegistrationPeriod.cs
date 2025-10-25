namespace StudentManagement.Models
{
    public class RegistrationPeriod
    {
        public int RegistrationPeriodId { get; set; }

        public Semester Semester { get; set; } = null!;
        public Department Department { get; set; } = null!;    // 🔗 đăng ký theo ngành

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive => DateTime.Now >= StartDate && DateTime.Now <= EndDate;
    }
}
