using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class SemesterRequest
    {
        [Required(ErrorMessage = "Year is required")]
        [Range(2000, 2100, ErrorMessage = "Year must be between 2000 and 2100")]
        public int Year { get; set; }
        
        [Required(ErrorMessage = "Term is required")]
        public string Term { get; set; } = string.Empty;
    }
}