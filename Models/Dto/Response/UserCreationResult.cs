namespace StudentManagement.Models.Dto.Response
{
    public class UserCreationResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new List<string>();
        public User? User { get; set; }
        public object? RoleSpecificEntity { get; set; }
    }

    public class StudentCreationResult
    {
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Student? Student { get; set; }
    }

    public class LecturerCreationResult
    {
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Lecturer? Lecturer { get; set; }
    }
}