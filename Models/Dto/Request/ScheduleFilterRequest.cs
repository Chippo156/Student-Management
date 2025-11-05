using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class ScheduleFilterRequest : PaginationParams
    {
        // Course filters
        public string? CourseCode { get; set; }
        public string? CourseName { get; set; }
        
        // Section filters
        public int? SectionId { get; set; }
        public string? SectionCode { get; set; }
        
        // Lecturer filters
        public string? LecturerName { get; set; }
        public string? LecturerCode { get; set; }
        
        // Time filters
        public DayOfWeek? DayOfWeek { get; set; }
        public DateOnly? Date { get; set; }
        public DateOnly? StartDateFrom { get; set; }
        public DateOnly? StartDateTo { get; set; }
        public TimeOnly? StartTimeFrom { get; set; }
        public TimeOnly? StartTimeTo { get; set; }
        
        // Location filters
        public string? Room { get; set; }
        
        // Academic filters
        public int? SemesterId { get; set; }
        public int? DepartmentId { get; set; }
        public int? ClassId { get; set; }
        
        // Schedule type filters
        public int? ScheduleTypeId { get; set; }
        
        // Practice group filters
        public bool? IsPracticeGroup { get; set; }
        public int? PracticeGroupId { get; set; }
        
        // Sorting options
        public string? SortBy { get; set; } = "semester"; // "CourseCode", "CourseName", "Lecturer", "DayOfWeek", "StartTime", "Room", "Semester", "Date"
        public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    }
}