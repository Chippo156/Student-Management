using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class Student
    {
        public int Id { get; set; }
        public User User { get; set; } = null!;
        public string MSSV { get; set; } = string.Empty;
        public Class Class { get; set; } = null!;
        public int YearOfAdmission { get; set; }
        public string TrainningLevel { get; set; } = string.Empty;
    }
}
