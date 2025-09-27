using System.ComponentModel.DataAnnotations;
using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Request
{
    public class DocumentRequestRequest
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }
        
        [Required(ErrorMessage = "Document type ID is required")]
        public int DocumentTypeId { get; set; }
        
        public DocRequestStatus Status { get; set; } = DocRequestStatus.Pending;
    }
}