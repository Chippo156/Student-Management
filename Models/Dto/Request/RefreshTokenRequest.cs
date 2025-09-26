namespace AuthProject.Models
{
    public class RefreshTokenRequest
    {
        public int UserId { get; set; }
        public required string RefreshToken { get; set; }
    }
}
