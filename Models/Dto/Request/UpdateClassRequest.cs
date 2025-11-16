using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class UpdateClassRequest
    {
        [Required(ErrorMessage = "Class name is required")]
        [StringLength(100, ErrorMessage = "Class name cannot exceed 100 characters")]
        public string ClassName { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "Program ID must be a positive number")]
        public int? ProgramId { get; set; }

        public int? LecturerId { get; set; } // Adviser lecturer
    }
}