using StudentManagement.Enum;
using System.Text.Json.Serialization;

namespace StudentManagement.Models
{
    public class ChatRoom
    {
        public int ChatRoomId { get; set; }
        public int SectionId { get; set; }
        public Section Section { get; set; } = null!;
        
        public string RoomName { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Chat messages in this room
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
        
        // Room participants
        public ICollection<ChatRoomParticipant> Participants { get; set; } = new List<ChatRoomParticipant>();
    }

    public class ChatMessage
    {
        public int ChatMessageId { get; set; }
        public int ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; } = null!;
        
        public int SenderId { get; set; }
        [JsonIgnore]
        public User Sender { get; set; } = null!;
        
        public string Content { get; set; } = string.Empty;
        public MessageType MessageType { get; set; } = MessageType.Text;
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
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