namespace StudentManagement.Models
{
    public class Schedule
    {
        public int ScheduleId { get; set; }
        public Section Section { get; set; } = null!;
        public ScheduleType ScheduleType { get; set; } = null!;
        public DateOnly? Date { get; set; } // Use for one-time events
        public DayOfWeek? DayOfWeek { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Room { get; set; } = string.Empty;
        public string? OnlineLink { get; set; }
    }
}