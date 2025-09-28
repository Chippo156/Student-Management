using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class UpdateUserRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public Gender Gender { get; set; } = Gender.MALE;
        public string Address { get; set; } = string.Empty;
        public IFormFile? AvatarUrl { get; set; }
    }
}
