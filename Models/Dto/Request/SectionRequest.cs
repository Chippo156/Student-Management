using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class SectionRequest
    {
        [Required(ErrorMessage = "Course ID is required")]
        public int CourseId { get; set; }
        
        [Required(ErrorMessage = "Lecturer ID is required")]
        public int LecturerId { get; set; }
        
        [Required(ErrorMessage = "Semester is required")]
        public int SemesterId { get; set; } 
    }
}