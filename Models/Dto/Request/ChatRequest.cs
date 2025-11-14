using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class SendMessageRequest
    {
        [Required]
        public int ChatRoomId { get; set; }
        
        [Required]
        [StringLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
        public string Content { get; set; } = string.Empty;
        
        public MessageType MessageType { get; set; } = MessageType.Text;
        public int? ReplyToMessageId { get; set; }
    }

    public class JoinChatRoomRequest
    {
        [Required]
        public int SectionId { get; set; }
    }
}