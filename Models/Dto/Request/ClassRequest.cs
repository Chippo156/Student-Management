using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class ClassRequest
    {
        [Required(ErrorMessage = "Class name is required")]
        public string ClassName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Program ID is required")]
        public int ProgramId { get; set; }
    }
}