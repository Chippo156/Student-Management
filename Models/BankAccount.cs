using StudentManagement.Enum;
using System.Text.Json.Serialization;

namespace StudentManagement.Models
{
    public class BankAccount
    {
        public int Id { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BankCode { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
        public DateOnly DateCreateAccount { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
        public bool IsDefault { get; set; } = false;

        [JsonIgnore]
        public User User { get; set; } = null!;

    }
}
