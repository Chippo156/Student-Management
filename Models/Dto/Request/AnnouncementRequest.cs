using System.ComponentModel.DataAnnotations;
using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Request
{
    public class AnnouncementRequest
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Content is required")]
        public string Content { get; set; } = string.Empty;
        
        public string? SourceUrl { get; set; } = string.Empty;
        
        public AnnouncementPriority Priority { get; set; } = AnnouncementPriority.Normal;
        public AnnouncementType Type { get; set; } = AnnouncementType.General;
        public AnnouncementTargetType TargetType { get; set; } = AnnouncementTargetType.All;
        
        // Đối tượng cụ thể (tùy chọn)
        public int? TargetDepartmentId { get; set; }
        public int? TargetYear { get; set; }
        
        public DateTime? ExpiryDate { get; set; }
        
        [Required(ErrorMessage = "Created by user ID is required")]
        public int CreatedByUserId { get; set; }
    }
}