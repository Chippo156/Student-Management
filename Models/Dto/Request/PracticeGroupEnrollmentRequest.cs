using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class PracticeGroupEnrollmentRequest
    {
        [Required]
        public int PracticeGroupId { get; set; }

        [Required]
        public int StudentId { get; set; }
    }
}