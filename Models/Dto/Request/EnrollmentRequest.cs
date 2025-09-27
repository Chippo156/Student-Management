using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class EnrollmentRequest
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }
        
        [Required(ErrorMessage = "Section ID is required")]
        public int SectionId { get; set; }

        public EnrollmentStatus? Status { get; set; } = EnrollmentStatus.Enrolled;

        public DateTime? RegisteredAt { get; set; }
        
    }
}