using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class DepartmentRequest
    {
        [Required(ErrorMessage = "Department name is required")]
        public string DepartmentName { get; set; } = string.Empty;
                
        [Required(ErrorMessage = "Faculty ID is required")]
        public int FacultyId { get; set; }
    }
}