using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class ForgotPasswordByMSSVRequest
    {
        [Required(ErrorMessage = "MSSV is required")]
        [StringLength(20, ErrorMessage = "MSSV cannot exceed 20 characters")]
        public string MSSV { get; set; } = string.Empty;
    }
    public class VerifyOtpRequest
    {
        [Required(ErrorMessage = "MSSV is required")]
        public string MSSV { get; set; } = string.Empty;

        [Required(ErrorMessage = "OTP code is required")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must contain only numbers")]
        public string OtpCode { get; set; } = string.Empty;
    }

    public class VerifyOtpResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();
    }
}