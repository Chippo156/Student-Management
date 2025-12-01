using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class ScheduleRequest
    {
        [Required(ErrorMessage = "Section ID is required")]
        public int SectionId { get; set; }

        [Required(ErrorMessage = "Schedule type ID is required")]
        public int ScheduleTypeId { get; set; }

        public DateOnly? Date { get; set; } // Use for one-time events

        public DayOfWeek? DayOfWeek { get; set; }
        
        [Required(ErrorMessage = "Start time is required")]
        public TimeOnly StartTime { get; set; }
        
        [Required(ErrorMessage = "End time is required")]
        public TimeOnly EndTime { get; set; }
        
        [Required(ErrorMessage = "Room is required")]
        public string Room { get; set; } = string.Empty;
        public string? OnlineLink { get; set; }

        // Practice group specific
        public int? PracticeGroupId { get; set; }
        public string? PracticeGroupName { get; set; }
        public int? LecturerId { get; set; }
        public int? MaxCapacity { get; set; }
    }
}