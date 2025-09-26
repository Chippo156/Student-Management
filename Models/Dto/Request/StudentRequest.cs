using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class StudentRequest
    {
        [Required(ErrorMessage = "MSSV is required")]
        public string MSSV { get; set; } = string.Empty;
        [Required(ErrorMessage = "UserId is required")]
        public int UserId { get; set; }
        [Required(ErrorMessage = "ClassId is required")]
        public int ClassId { get; set; }
    }
}
