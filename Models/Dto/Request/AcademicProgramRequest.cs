using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class AcademicProgramRequest
    {
        [Required(ErrorMessage = "Program name is required")]
        public string ProgramName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Degree level is required")]
        public string DegreeLevel { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Department ID is required")]
        public int DepartmentId { get; set; }
    }
}