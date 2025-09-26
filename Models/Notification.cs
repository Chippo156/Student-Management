using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public Announcement Announcement { get; set; } = null!;
        public User User { get; set; } = null!;
        public NotificationStatus Status { get; set; } = NotificationStatus.Unread;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
