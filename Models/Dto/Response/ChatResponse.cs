namespace StudentManagement.Models.Dto.Response
{
    public class ChatRoomResponse
    {
        public int ChatRoomId { get; set; }

        // Deprecated fields (keep for backward compatibility)
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;

        // New fields
        public string RoomName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ChatType { get; set; } = string.Empty; // "ClassTeacher" or "AcademicStaff"

        // Teacher information
        public string LecturerName { get; set; } = string.Empty;

        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Participant info
        public int TotalParticipants { get; set; }
        public int OnlineCount { get; set; }

        // Last message info
        public ChatMessageResponse? LastMessage { get; set; }
        public int UnreadCount { get; set; }
    }
}