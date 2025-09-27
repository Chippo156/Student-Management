using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class GradeRequest
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }
        
        [Required(ErrorMessage = "Assessment ID is required")]
        public int AssessmentId { get; set; }
        
        [Required(ErrorMessage = "Score is required")]
        [Range(0, 10, ErrorMessage = "Score must be between 0 and 10")]
        public double Score { get; set; }
    }
}