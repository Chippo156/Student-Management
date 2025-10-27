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

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int Capacity { get; set; }

        public SectionStatus Status { get; set; } = SectionStatus.IsPreparing;

    }
}