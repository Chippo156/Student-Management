using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class GpaSnapshotRequest
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }
        
        [Required(ErrorMessage = "Semester Id is required")]
        public int SemesterId { get; set; }
        
        [Required(ErrorMessage = "GPA is required")]
        [Range(0, 4, ErrorMessage = "GPA must be between 0 and 4")]
        public double GPA { get; set; }
    }
}