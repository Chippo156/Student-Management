using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class AdviserAssignment
    {
        public int Id { get; set; }
        public Lecturer Lecturer { get; set; } = null!;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int ClassId { get; set; }
        public Class Class { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
