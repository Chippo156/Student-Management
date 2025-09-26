namespace StudentManagement.Models
{
    public class Schedule
    {
        public int ScheduleId { get; set; }
        public Section Section { get; set; } = null!;
        public DayOfWeek DayOfWeek { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Room { get; set; } = string.Empty;
    }
}