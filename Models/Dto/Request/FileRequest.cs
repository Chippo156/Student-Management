using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace StudentManagement.Models.Dto.Request
{
    public class FileRequest
    {
        [Required(ErrorMessage = "File is required")]
        public IFormFile File { get; set; } = null!;
        
        [Required(ErrorMessage = "Uploaded by user ID is required")]
        public int UploadedByUserId { get; set; }
    }
}