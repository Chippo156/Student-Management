using StudentManagement.Enum;

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
        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
        public required Role Role { get; set; }
    }
}
