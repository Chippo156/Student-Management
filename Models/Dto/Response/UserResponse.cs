using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class UserResponse
    {
        public required int UserId { get; set; }
        public required string Username { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public required string Role { get; set; }
        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
    }
}
