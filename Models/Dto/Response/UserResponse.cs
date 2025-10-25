using StudentManagement.Enum;
using StudentManagement.Models.Embed;

namespace StudentManagement.Models.Dto.Response
{
    public class UserResponse
    {
        public required string Username { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public Gender Gender { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? Religion { get; set; }
        public DateOnly? DateOfBirth { get; set; }

        public string? CitizenIdCard { get; set; } = string.Empty;
        public DateOnly? IssuedDate { get; set; }
        public string? Object { get; set; } = string.Empty;
        public string? PolicyArea { get; set; }
        public DateOnly? DateOfJoinUnion { get; set; }
        public DateOnly? DateOfJoinParty { get; set; }
        public BankAccountResponse? BankAccount { get; set; }

        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
        public required Role Role { get; set; }
    }
}
