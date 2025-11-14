using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class ChatRoomResponse
    {
        public int ChatRoomId { get; set; }
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Lecturer information
        public string LecturerName { get; set; } = string.Empty;
        
        // Participants count
        public int TotalParticipants { get; set; }
        public int OnlineCount { get; set; }
        
        // Last message info
        public ChatMessageResponse? LastMessage { get; set; }
        public int UnreadCount { get; set; }
    }

    public class ChatMessageResponse
    {
        public int ChatMessageId { get; set; }
        public int ChatRoomId { get; set; }
        
        // Sender information
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public bool IsCurrentUser { get; set; }
        
        // Message content
        public string Content { get; set; } = string.Empty;
        public MessageType MessageType { get; set; }
        public string MessageTypeText { get; set; } = string.Empty;
        
        // Timestamps
        public DateTime SentAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public bool IsDeleted { get; set; }
        
        // Reply information
        public int? ReplyToMessageId { get; set; }
        public ChatMessageResponse? ReplyToMessage { get; set; }
    }

    public class ChatParticipantResponse
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public ParticipantRole Role { get; set; }
        public string RoleText { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public DateTime? LastSeenAt { get; set; }
        public bool IsOnline { get; set; }
    }
}