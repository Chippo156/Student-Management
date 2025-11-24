using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class AdviserAssignmentRequest
    {
        [Required(ErrorMessage = "Tên giảng viên là bắt buộc")]
        public int LecturerId { get; set; }
        
        [Required(ErrorMessage = "Id class là bắt buộc")]
        public int ClassId { get; set; }
        
        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc")]
        public DateOnly StartDate { get; set; }
        
        public DateOnly? EndDate { get; set; }
    }
}