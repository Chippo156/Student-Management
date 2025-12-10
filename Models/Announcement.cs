using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class Announcement
    {
        public int AnnouncementId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string SourceUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Thêm các field mới
        public AnnouncementPriority Priority { get; set; } = AnnouncementPriority.Normal;
        public AnnouncementType Type { get; set; } = AnnouncementType.General;
        public AnnouncementTargetType TargetType { get; set; } = AnnouncementTargetType.All;
        
        // Đối tượng cụ thể (tùy chọn theo TargetType)
        public int? TargetDepartmentId { get; set; }
        public Department? TargetDepartment { get; set; }
        public int? TargetYear { get; set; } // Năm học
        
        // Người tạo
        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;
        
        // Trạng thái
        public bool IsActive { get; set; } = true;
        public DateTime? ExpiryDate { get; set; } // Ngày hết hạn thông báo
    }
}