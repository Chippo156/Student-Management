using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IChatService
    {
        // Thay đổi từ section-based sang teacher-based
        Task<ChatRoomResponse> GetOrCreateChatRoomWithClassTeacherAsync(string studentUsername);
        Task<ChatRoomResponse> GetOrCreateChatRoomWithAcademicStaffAsync(string studentUsername);
        Task<ChatRoomResponse> GetOrCreateChatRoomWithAIAsync(string studentUsername); // New method
        Task<ChatMessageResponse> SendMessageAsync(SendMessageRequest request, string username);
        Task<PagedResult<ChatMessageResponse>> GetChatMessagesAsync(int chatRoomId, string username, PaginationParams pagination);
        Task<List<ChatRoomResponse>> GetUserChatRoomsAsync(string username);
        Task<bool> VerifyUserAccessToChatRoomAsync(string username, int chatRoomId);
        Task UpdateLastSeenAsync(string username, int chatRoomId);
        Task UpdateUserOfflineStatusAsync(string username);
        Task MarkMessageAsReadAsync(string username, int messageId);
    }
}