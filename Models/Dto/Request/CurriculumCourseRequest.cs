using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class CurriculumCourseRequest
    {
        public CourseRequest? Course { get; set; }
        [Required(ErrorMessage = "Program ID is required")]
        public int ProgramId { get; set; }
        
        [Required(ErrorMessage = "Course ID is required")]
        public int CourseId { get; set; }
        
        [Required(ErrorMessage = "Required status is required")]
        public bool IsRequired { get; set; }
        
        [Required(ErrorMessage = "Semester suggested is required")]
        [Range(1, 20, ErrorMessage = "Semester suggested must be between 1 and 20")]
        public int SemesterSuggested { get; set; }
    }
}