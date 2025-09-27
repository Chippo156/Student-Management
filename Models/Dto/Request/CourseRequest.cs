using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class CourseRequest
    {
        [Required(ErrorMessage = "Course name is required")]
        public string CourseName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Course code is required")]
        public string CourseCode { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "CreditsTheory is required")]
        [Range(1, 10, ErrorMessage = "CreditsTheory must be between 1 and 10")]
        public int CreditsTheory { get; set; }
        
        [Range(0, 10, ErrorMessage = "CreditsLab must be between 0 and 10")]
        public int CreditsLab { get; set; }
    }
}