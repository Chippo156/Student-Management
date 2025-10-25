using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class CourseEnrollmentRequest
    {
        [Required]
        public int SectionId { get; set; }
    }
}