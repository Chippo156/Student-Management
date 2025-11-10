using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class SectionSearchRequest : PaginationParams
    {
        public string? SectionCode { get; set; }
        public string? CourseName { get; set; }
        public string? LecturerName { get; set; }
        public int? SemesterId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CourseId { get; set; }
        public SectionStatus? Status { get; set; }
        // Sorting options
        public string? SortBy { get; set; } = "SectionCode"; // "SectionCode", "CourseName", "StartDate", "Capacity", "EnrolledCount"
        public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    }
}