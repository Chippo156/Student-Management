using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IChatService
    {
        Task<ChatRoomResponse> GetOrCreateChatRoomForSectionAsync(int sectionId, string username);
        Task<ChatMessageResponse> SendMessageAsync(SendMessageRequest request, string username);
        Task<PagedResult<ChatMessageResponse>> GetChatMessagesAsync(int chatRoomId, string username, PaginationParams pagination);
        Task<List<ChatRoomResponse>> GetUserChatRoomsAsync(string username);
        Task<bool> VerifyUserAccessToChatRoomAsync(string username, int chatRoomId);
        Task UpdateLastSeenAsync(string username, int chatRoomId);
        Task UpdateUserOfflineStatusAsync(string username);
        Task MarkMessageAsReadAsync(string username, int messageId);
    }
}