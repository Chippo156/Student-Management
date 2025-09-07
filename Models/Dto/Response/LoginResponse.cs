namespace StudentManagement.Models.Dto.Response
{
    public class LoginResponse
    {
        public required TokenResponse Token { get; set; }
        public required User User { get; set; }
    }
}
