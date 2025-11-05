using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class AcademicProgramSearchRequest : PaginationParams
    {
        public string? ProgramName { get; set; }
        public int? DepartmentId { get; set; }
        public int? FacultyId { get; set; }
        public string? DegreeLevel { get; set; }
        public int? MinCredits { get; set; }
        public int? MaxCredits { get; set; }
        
        // Sorting options
        public string? SortBy { get; set; } // "ProgramName", "DegreeLevel", "Credits", "Department"
        public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    }
}