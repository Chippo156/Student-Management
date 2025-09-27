namespace StudentManagement.Models
{
    public class Class
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public AcademicProgram Program { get; set; } = null!;
        public AdviserAssignment? AdviserAssignment { get; set; }
    }
}
