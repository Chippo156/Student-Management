namespace StudentManagement.Models
{
    public class OtpVerification
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; } = false;
        public string Purpose { get; set; } = "ForgotPassword"; // ForgotPassword, EmailVerification, etc.
        public int AttemptCount { get; set; } = 0;
        public bool IsBlocked { get; set; } = false;
    }
}