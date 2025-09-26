namespace StudentManagement.Models
{
    public class Program
    {
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        public Department Department { get; set; } = null!;
    }
}
