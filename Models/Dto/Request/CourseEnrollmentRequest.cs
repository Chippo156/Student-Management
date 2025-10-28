using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class CourseEnrollmentRequest
    {
        [Required]
        public int SectionId { get; set; }
        
        // Optional: Chọn nhóm thực hành (nếu môn có thực hành)
        public int? PracticeGroupId { get; set; }
    }
}