using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class FinalResultRequest
    {
        [Required(ErrorMessage = "Section ID is required")]
        public int SectionId { get; set; }
        
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }
        
        [Required(ErrorMessage = "Final score is required")]
        [Range(0, 10, ErrorMessage = "Final score must be between 0 and 10")]
        public double FinalScore { get; set; }
        
        [Required(ErrorMessage = "Grade letter is required")]
        public string GradeLetter { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Grade point is required")]
        [Range(0, 4, ErrorMessage = "Grade point must be between 0 and 4")]
        public double GradePoint { get; set; }
    }
}