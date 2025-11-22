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
        public DateOnly? DateOfAdmission { get; set; }
        public StudentStatus StudentStatus { get; set; } = StudentStatus.Active;
        public DateOnly GraduationDate { get; set; }


    }
}
