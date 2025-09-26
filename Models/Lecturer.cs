using System.Reflection;

namespace StudentManagement.Models
{
    public class Lecturer
    {
        public int Id { get; set; }
        public User User { get; set; } = null!;
        public Department Department { get; set; } = null!;
        public String Position { get; set; } = string.Empty;
        public String AcademicTitle { get; set; } = string.Empty;
    }
}