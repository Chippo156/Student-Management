using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentManagement.Models
{
    public class ChatRoom
    {
        [Key]
        public int ChatRoomId { get; set; }
        
        // Không còn liên kết với Section
        // public int SectionId { get; set; }
        // [JsonIgnore]
        // public Section Section { get; set; } = null!;
        
        // Thêm các trường mới
        public ChatType ChatType { get; set; }
        
        // Liên kết với Class (cho chat với chủ nhiệm)
        public int? ClassId { get; set; }
        [JsonIgnore]
        public Class? Class { get; set; }
        
        // Liên kết với Department (cho chat với học vụ)
        public int? DepartmentId { get; set; }
        [JsonIgnore]
        public Department? Department { get; set; }
        
        [Required]
        [StringLength(200)]
        public string RoomName { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
        
        [JsonIgnore]
        public ICollection<ChatRoomParticipant> Participants { get; set; } = new List<ChatRoomParticipant>();
    }

    public class ChatMessage
    {
        public int ChatMessageId { get; set; }
        public int ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; } = null!;

        public int? SenderId { get; set; }  // Cho phép null
        [JsonIgnore]
        public User? Sender { get; set; } = null!;

        [Column(TypeName = "nvarchar(max)")]
        public string Content { get; set; } = string.Empty;

        public MessageType MessageType { get; set; } = MessageType.Text;
        
        public DateTime SentAt { get; set; } = DateTime.Now;
        public DateTime? EditedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        
        // Reply to another message
        public int? ReplyToMessageId { get; set; }
        public ChatMessage? ReplyToMessage { get; set; }
    }

    public class ChatRoomParticipant
    {
        public int ChatRoomParticipantId { get; set; }
        public int ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; } = null!;
        
        public int UserId { get; set; }
        [JsonIgnore]
        public User User { get; set; } = null!;
        
        public ParticipantRole Role { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastSeenAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
}