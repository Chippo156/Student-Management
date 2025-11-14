using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class AnnouncementResponse
    {
        public int AnnouncementId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string SourceUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; }
        
        // Priority
        public AnnouncementPriority Priority { get; set; }
        public string PriorityText { get; set; } = string.Empty;
        public string PriorityColor { get; set; } = string.Empty;
        
        // Type
        public AnnouncementType Type { get; set; }
        public string TypeText { get; set; } = string.Empty;
        public string TypeIcon { get; set; } = string.Empty;
        
        // Target
        public AnnouncementTargetType TargetType { get; set; }
        public string TargetTypeText { get; set; } = string.Empty;
        public string TargetDescription { get; set; } = string.Empty;
        
        // Creator
        public string CreatedByUserName { get; set; } = string.Empty;
        public string CreatedByFullName { get; set; } = string.Empty;
        
        // Status
        public bool IsExpired { get; set; }
        public int DaysUntilExpiry { get; set; }
    }

    public class AnnouncementListResponse : AnnouncementResponse
    {
        public int ViewCount { get; set; } // Số lượt xem
        public DateTime? LastViewedAt { get; set; } // Lần xem cuối
    }
}