using StudentManagement.Enum;
using StudentManagement.Models.Embed;

namespace StudentManagement.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public Gender Gender { get; set; } = Gender.MALE;
        public string Address { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string? PlaceOfBirth { get; set; }
        public string? Religion { get; set; }
        public DateOnly? DateOfBirth { get; set; }

        public string? CitizenIdCard { get; set; } = string.Empty;
        public DateOnly? IssuedDate { get; set; }
        public string? IssuedPlace { get; set; } = string.Empty;
        public string? Object { get; set; } = string.Empty;
        public string? PolicyArea { get; set; }
        public DateOnly? DateOfJoinUnion { get; set; }
        public DateOnly? DateOfJoinParty { get; set; }
        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
        public string? RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Role Role { get; set; } = null!;
        public ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
    }
}