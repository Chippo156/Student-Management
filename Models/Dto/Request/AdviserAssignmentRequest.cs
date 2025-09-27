using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class AdviserAssignmentRequest
    {
        [Required(ErrorMessage = "Lecturer ID is required")]
        public int LecturerId { get; set; }
        
        [Required(ErrorMessage = "Class ID is required")]
        public int ClassId { get; set; }
        
        [Required(ErrorMessage = "Start date is required")]
        public DateOnly StartDate { get; set; }
        
        public DateOnly? EndDate { get; set; }
    }
}