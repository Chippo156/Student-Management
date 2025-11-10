using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class PracticeGroupRequest
    {
        [Required]
        [StringLength(50)]
        public string GroupName { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Description { get; set; }

        [Required]
        [Range(1, 100)]
        public int MaxCapacity { get; set; } = 20;

        [Required]
        public int SectionId { get; set; }

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