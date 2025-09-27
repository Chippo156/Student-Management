using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class RoleRequest
    {
        [Required(ErrorMessage = "Role name is required")]
        public string RoleName { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
    }
}