using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class ScheduleRequest
    {
        [Required(ErrorMessage = "Section ID is required")]
        public int SectionId { get; set; }
        
        [Required(ErrorMessage = "Day of week is required")]
        [Range(0, 6, ErrorMessage = "Day of week must be between 0 (Sunday) and 6 (Saturday)")]
        public DayOfWeek DayOfWeek { get; set; }
        
        [Required(ErrorMessage = "Start time is required")]
        public TimeOnly StartTime { get; set; }
        
        [Required(ErrorMessage = "End time is required")]
        public TimeOnly EndTime { get; set; }
        
        [Required(ErrorMessage = "Room is required")]
        public string Room { get; set; } = string.Empty;
    }
}