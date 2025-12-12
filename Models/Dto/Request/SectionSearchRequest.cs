using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class SectionSearchRequest : PaginationParams
    {
        public string? Search { get; set; } // General search term
        public int? SemesterId { get; set; }
        // Sorting options
        public string? SortBy { get; set; } = "SectionCode"; // "SectionCode", "CourseName", "StartDate", "Capacity", "EnrolledCount"
        public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    }
}