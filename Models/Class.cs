namespace StudentManagement.Models
{
    public class Class
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public Program Program { get; set; } = null!;
    }
}
