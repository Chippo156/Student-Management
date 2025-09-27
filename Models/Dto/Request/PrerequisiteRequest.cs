using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class PrerequisiteRequest
    {
        [Required(ErrorMessage = "Course ID is required")]
        public int CourseId { get; set; }
        
        [Required(ErrorMessage = "Prerequisite course ID is required")]
        public int PrerequisiteCourseId { get; set; }
    }
}