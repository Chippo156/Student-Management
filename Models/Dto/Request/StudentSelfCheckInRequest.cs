using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class StudentSelfCheckInRequest
    {
        [Required(ErrorMessage = "Attendance session ID is required")]
        public int AttendanceSessionId { get; set; }
        
        [Required(ErrorMessage = "Vui lòng nhập mã điểm danh")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã điểm danh gồm 6 ký tự số")]
        public string CheckInCode { get; set; } = string.Empty;
        
        public string? Note { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    public class StudentCheckInStatusRequest
    {
        [Required]
        public int AttendanceSessionId { get; set; }
    }
}