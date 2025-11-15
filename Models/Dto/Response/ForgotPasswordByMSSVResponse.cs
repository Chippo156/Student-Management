namespace StudentManagement.Models.Dto.Response
{
    public class ForgotPasswordByMSSVResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();
        public string? StudentName { get; set; }
        public string? Email { get; set; }
    }
}