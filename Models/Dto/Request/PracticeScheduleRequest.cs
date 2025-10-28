using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class PracticeScheduleRequest
    {
        [Required]
        public int PracticeGroupId { get; set; }

        public DayOfWeek? DayOfWeek { get; set; }

        public DateOnly? Date { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        [Required]
        [StringLength(50)]
        public string Room { get; set; } = string.Empty;

        public string? OnlineLink { get; set; }

        [Required]
        public int ScheduleTypeId { get; set; } = 2; // Practice schedule type
    }
}