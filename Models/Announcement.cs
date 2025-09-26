namespace StudentManagement.Models
{
    public class Announcement
    {
        public int AnnouncementId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public User CreatedBy { get; set; } = null!;
    }
}