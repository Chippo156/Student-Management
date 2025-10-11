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
        public int? YearOfAddmision { get; set; }
        public string? TrainningLevel { get; set; }
    }

}
