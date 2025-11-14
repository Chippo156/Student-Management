using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;
        private readonly IChatService _chatService;

        public ChatHub(AppDbContext context, IChatService chatService)
        {
            _context = context;
            _chatService = chatService;
        }

        public async Task JoinChatRoom(int chatRoomId)
        {
            var username = Context.User?.FindFirstValue(ClaimTypes.Name);
            if (username == null) return;

            // Verify user has access to this chat room
            var hasAccess = await _chatService.VerifyUserAccessToChatRoomAsync(username, chatRoomId);
            if (!hasAccess) return;

            await Groups.AddToGroupAsync(Context.ConnectionId, $"ChatRoom_{chatRoomId}");
            
            // Update user's last seen
            await _chatService.UpdateLastSeenAsync(username, chatRoomId);
            
            // Notify others that user joined
            await Clients.Group($"ChatRoom_{chatRoomId}")
                .SendAsync("UserJoined", new { Username = username, ConnectionId = Context.ConnectionId });
        }

        public async Task LeaveChatRoom(int chatRoomId)
        {
            var username = Context.User?.FindFirstValue(ClaimTypes.Name);
            if (username == null) return;

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ChatRoom_{chatRoomId}");
            
            // Update user's last seen
            await _chatService.UpdateLastSeenAsync(username, chatRoomId);
            
            // Notify others that user left
            await Clients.Group($"ChatRoom_{chatRoomId}")
                .SendAsync("UserLeft", new { Username = username });
        }

        public async Task SendMessage(SendMessageRequest request)
        {
            var username = Context.User?.FindFirstValue(ClaimTypes.Name);
            if (username == null) return;

            try
            {
                var message = await _chatService.SendMessageAsync(request, username);
                
                // Send message to all users in the chat room
                await Clients.Group($"ChatRoom_{request.ChatRoomId}")
                    .SendAsync("ReceiveMessage", message);
            }
            catch (Exception ex)
            {
                // Send error back to sender
                await Clients.Caller.SendAsync("Error", new { Message = ex.Message });
            }
        }

        public async Task MarkAsRead(int chatRoomId, int messageId)
        {
            var username = Context.User?.FindFirstValue(ClaimTypes.Name);
            if (username == null) return;

            await _chatService.MarkMessageAsReadAsync(username, messageId);
        }

        public async Task StartTyping(int chatRoomId)
        {
            var username = Context.User?.FindFirstValue(ClaimTypes.Name);
            if (username == null) return;

            await Clients.OthersInGroup($"ChatRoom_{chatRoomId}")
                .SendAsync("UserTyping", new { Username = username });
        }

        public async Task StopTyping(int chatRoomId)
        {
            var username = Context.User?.FindFirstValue(ClaimTypes.Name);
            if (username == null) return;

            await Clients.OthersInGroup($"ChatRoom_{chatRoomId}")
                .SendAsync("UserStoppedTyping", new { Username = username });
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var username = Context.User?.FindFirstValue(ClaimTypes.Name);
            if (username != null)
            {
                // Update last seen for all chat rooms user was in
                await _chatService.UpdateUserOfflineStatusAsync(username);
            }
            
            await base.OnDisconnectedAsync(exception);
        }
    }
}