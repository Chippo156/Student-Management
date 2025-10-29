namespace StudentManagement.Models.Dto.Response
{
    public class UserUpdateResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new List<string>();
        public User? User { get; set; }
        public object? RoleSpecificEntity { get; set; }
    }
}