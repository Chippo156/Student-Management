using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class ChatMessageResponse
    {
        public int ChatMessageId { get; set; }
        public int ChatRoomId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public bool IsCurrentUser { get; set; }
        public string Content { get; set; } = string.Empty;
        public MessageType MessageType { get; set; }
        public string MessageTypeText { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public bool IsDeleted { get; set; }
        
        // Reply information
        public int? ReplyToMessageId { get; set; }
        public ChatMessageResponse? ReplyToMessage { get; set; }
    }
}