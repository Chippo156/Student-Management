using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class BankAccountResponse
    {
        public int Id { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BankCode { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        
        public int UserId { get; set; }
        public AccountStatus AccountStatus { get; set; }
        public DateOnly DateCreateAccount { get; set; }

    }
}
