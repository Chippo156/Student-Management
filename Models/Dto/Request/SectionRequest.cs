using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class SectionRequest
    {
        [Required(ErrorMessage = "Course ID is required")]
        public int CurriculumCourseId { get; set; }
        
        [Required(ErrorMessage = "Lecturer ID is required")]
        public int LecturerId { get; set; }
        
        [Required(ErrorMessage = "Semester is required")]
        public int SemesterId { get; set; }

        [Required(ErrorMessage = "Class ID is required")]
        public int ClassId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateOnly StartDate { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateOnly EndDate { get; set; }

        [Required]
        [Range(1, 200, ErrorMessage = "Capacity must be between 1 and 200")]
        public int Capacity { get; set; }

        [Range(0, 200, ErrorMessage = "MinEnrollment must be between 0 and 200")]
        public int? MinEnrollment { get; set; }

        [Range(0.0, 1.0, ErrorMessage = "MinEnrollmentPercentage must be between 0 and 1")]
        public double? MinEnrollmentPercentage { get; set; }
    }
}