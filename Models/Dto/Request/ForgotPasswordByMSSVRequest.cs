using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class ForgotPasswordByMSSVRequest
    {
        [Required(ErrorMessage = "MSSV is required")]
        [StringLength(20, ErrorMessage = "MSSV cannot exceed 20 characters")]
        public string MSSV { get; set; } = string.Empty;
    }
}