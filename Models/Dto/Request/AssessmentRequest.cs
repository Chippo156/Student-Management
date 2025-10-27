using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class AssessmentRequest
    {
        [Required(ErrorMessage = "Section ID is required")]
        public int SectionId { get; set; }
        
        [Required(ErrorMessage = "Title is required")]
        public string Title { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Weight is required")]
        [Range(1, 100, ErrorMessage = "Weight must be between 1 and 100")]
        public int Weight { get; set; }
        [Required(ErrorMessage = "AssessmentTypeId is required")]

        public int AssessmentTypeId { get; set; }
    }
}