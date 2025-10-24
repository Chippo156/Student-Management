namespace StudentManagement.Models.Dto.Response
{
    public class StudentDetailDto
    {
        public int StudentId { get; set; }
        public UserResponse User { get; set; } = null!;
        public string MSSV { get; set; } = null!;
        public string? ClassName { get; set; } = null!;
        public string? ProgramName { get; set; }
        public string? DepartmentName { get; set; }
        public int? YearOfAdmission { get; set; }
        public DateOnly? DateOfAdmission { get; set; }
        public string? TrainningLevel { get; set; }
        public int? TotalCreditsRequired { get; set; }
    }

}
