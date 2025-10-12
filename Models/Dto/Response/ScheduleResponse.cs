using System;

namespace StudentManagement.Models.Dto.Response
{
    public class ScheduleResponse
    {
        public int ScheduleId { get; set; }
        
        // Course information
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        
        // Schedule type
        public int ScheduleTypeId { get; set; }
        public string ScheduleTypeName { get; set; } = string.Empty;
        
        // Time information
        public DateOnly? Date { get; set; }
        public DayOfWeek? DayOfWeek { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        
        // Location information
        public string Room { get; set; } = string.Empty;
        public string? OnlineLink { get; set; }
        
        // Section information
        public int SectionId { get; set; }
        
        // Lecturer information
        public string LecturerName { get; set; } = string.Empty;
    }
}