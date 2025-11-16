namespace StudentManagement.Models.Dto.Request
{
    public class ResetPasswordRequest
    {
        public required string OldPassword { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmPassword { get; set; }
    }
}