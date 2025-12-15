using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class StudentSelfCheckInRequest
    {
        [Required(ErrorMessage = "Attendance session ID is required")]
        public int AttendanceSessionId { get; set; }
        
        [Required(ErrorMessage = "Check-in code is required")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Check-in code must be 6 characters")]
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