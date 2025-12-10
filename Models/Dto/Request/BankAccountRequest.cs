using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class BankAccountRequest
    {
        
        [Required]
        [StringLength(50)]
        public string AccountNumber { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string BankName { get; set; } = string.Empty;

        public string BankCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Branch { get; set; } = string.Empty;
        public DateOnly? DateCreateAccount { get; set; } = DateOnly.FromDateTime(DateTime.Now);

        [Required]
        [StringLength(100)]
        public string AccountHolderName { get; set; } = string.Empty;
        
        public bool IsDefault { get; set; } = false;
    }
}