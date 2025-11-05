using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class CurriculumCourseSearchRequest : PaginationParams
    {
        public string? CourseCode { get; set; }
        public string? CourseName { get; set; }
        public int? ProgramId { get; set; }
        public int? DepartmentId { get; set; }
        public int? SemesterSuggested { get; set; }
        public bool? IsRequired { get; set; }
        public int? MinCredits { get; set; }
        public int? MaxCredits { get; set; }
        
        // Sorting options
        public string? SortBy { get; set; } // "CourseCode", "CourseName", "Credits", "Semester"
        public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    }
}