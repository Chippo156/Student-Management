namespace StudentManagement.Models
{
    public class AcademicProgram
    {
        public int AcademicProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        public int CreditsRequired { get; set; }
        public Department Department { get; set; } = null!;
        public DateTime? CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}
