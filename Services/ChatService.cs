using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Hubs;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _context;
        private readonly IGeminiAIService _geminiAIService;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatService(AppDbContext context, IGeminiAIService geminiAIService, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _geminiAIService = geminiAIService;
            _hubContext = hubContext;
        }

        public async Task<ChatRoomResponse> GetOrCreateChatRoomWithClassTeacherAsync(string studentUsername)
        {
            // Lấy thông tin sinh viên
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                .FirstOrDefaultAsync(s => s.User.Username == studentUsername)
                ?? throw new Exception("Không tìm thấy sinh viên");

            // Lấy thông tin giảng viên chủ nhiệm
            var classTeacher = await _context.AdviserAssignments
                .Include(aa => aa.Lecturer)
                    .ThenInclude(l => l.User)
                .Where(aa => aa.ClassId == student.Class.ClassId && aa.IsActive)
                .FirstOrDefaultAsync()
                ?? throw new Exception("Không tìm thấy giáo viên dạy lớp");

            // **CHANGED: Tìm room riêng của sinh viên này với giảng viên chủ nhiệm**
            var existingRoom = await _context.ChatRooms
                .Include(cr => cr.Class)
                .FirstOrDefaultAsync(cr => cr.ChatType == ChatType.ClassTeacher &&
                                          cr.ClassId == student.Class.ClassId &&
                                          _context.ChatRoomParticipants.Any(p =>
                                              p.ChatRoomId == cr.ChatRoomId &&
                                              p.User.Username == studentUsername &&
                                              p.IsActive));

            if (existingRoom != null)
            {
                return await MapToChatRoomResponseAsync(existingRoom, studentUsername);
            }

            // **CHANGED: Tạo room riêng cho sinh viên này**
            var chatRoom = new ChatRoom
            {
                ChatType = ChatType.ClassTeacher,
                ClassId = student.Class.ClassId,
                Class = student.Class,
                RoomName = $"Chat với GV Chủ nhiệm - {student.User.FullName}",
                Description = $"Chat riêng giữa {student.User.FullName} và giảng viên chủ nhiệm lớp {student.Class.ClassName}"
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // **CHANGED: Chỉ thêm giảng viên và sinh viên này vào room**
            await AddParticipantAsync(chatRoom.ChatRoomId, classTeacher.Lecturer.User.Username, ParticipantRole.Lecturer);
            await AddParticipantAsync(chatRoom.ChatRoomId, studentUsername, ParticipantRole.Student);

            return await MapToChatRoomResponseAsync(chatRoom, studentUsername);
        }

        public async Task<ChatRoomResponse> GetOrCreateChatRoomWithAcademicStaffAsync(string studentUsername)
        {
            // Lấy thông tin sinh viên
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                .FirstOrDefaultAsync(s => s.User.Username == studentUsername)
                ?? throw new Exception("Không tìm thấy sinh viên");

            // Tìm room đã tồn tại cho department
            var existingRoom = await _context.ChatRooms
                .Include(cr => cr.Class)
                .FirstOrDefaultAsync(cr => cr.ChatType == ChatType.AcademicStaff &&
                                          cr.ClassId == student.Class.ClassId &&
                                          _context.ChatRoomParticipants.Any(p =>
                                              p.ChatRoomId == cr.ChatRoomId &&
                                              p.User.Username == studentUsername &&
                                              p.IsActive));

            if (existingRoom != null)
            {
                // Ensure user is participant
                await EnsureUserIsParticipantAsync(existingRoom.ChatRoomId, studentUsername);
                return await MapToChatRoomResponseAsync(existingRoom, studentUsername);
            }

            // Tạo room mới
            var chatRoom = new ChatRoom
            {
                ChatType = ChatType.AcademicStaff,
                DepartmentId = student.Class.Program.Department.DepartmentId,
                Department = student.Class.Program.Department,
                RoomName = $"{student.MSSV}-{student.User.FullName} - {student.Class.Program.Department.DepartmentName}",
                Description = $"Chat với giáo viên học vụ khoa {student.Class.Program.Department.DepartmentName}"
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            var admin = await _context.Users
                .Where(u => u.Role.RoleName == "Admin")
                .FirstOrDefaultAsync();
            
            await AddParticipantAsync(chatRoom.ChatRoomId, admin.Username, ParticipantRole.Assistant);

            // Add requesting student as participant
            await EnsureUserIsParticipantAsync(chatRoom.ChatRoomId, studentUsername);

            return await MapToChatRoomResponseAsync(chatRoom, studentUsername);
        }

        public async Task<ChatRoomResponse> GetOrCreateChatRoomWithAIAsync(string studentUsername)
        {
            // Lấy thông tin sinh viên
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                .FirstOrDefaultAsync(s => s.User.Username == studentUsername)
                ?? throw new Exception("Không tìm thấy sinh viên");

            // Tìm room AI đã tồn tại cho sinh viên này
            var existingRoom = await _context.ChatRooms
                .FirstOrDefaultAsync(cr => cr.ChatType == ChatType.AI &&
                                          cr.ChatRoomId > 0 && // AI rooms are personal
                                          _context.ChatRoomParticipants.Any(p => p.ChatRoomId == cr.ChatRoomId && p.User.Username == studentUsername));

            if (existingRoom != null)
            {
                return await MapToChatRoomResponseAsync(existingRoom, studentUsername);
            }

            // Tạo room AI mới cho sinh viên
            var chatRoom = new ChatRoom
            {
                ChatType = ChatType.AI,
                ClassId = null, // AI chat không liên kết với class
                DepartmentId = null, // AI chat không liên kết với department
                RoomName = "🤖 EduBot - Trợ lý AI",
                Description = "Chat với trợ lý AI thông minh - Hỗ trợ học tập và giải đáp thắc mắc"
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // Add student as participant
            await EnsureUserIsParticipantAsync(chatRoom.ChatRoomId, studentUsername);

            // Send welcome message from AI
            await SendAIWelcomeMessage(chatRoom.ChatRoomId, student.User.FullName);

            return await MapToChatRoomResponseAsync(chatRoom, studentUsername);
        }

        public async Task<ChatMessageResponse> SendMessageAsync(SendMessageRequest request, string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username)
                ?? throw new Exception("User not found");

            // Verify user has access to chat room
            var hasAccess = await VerifyUserAccessToChatRoomAsync(username, request.ChatRoomId);
            if (!hasAccess)
                throw new Exception("Truy cập vào phòng chat này bị từ chối");

            var message = new ChatMessage
            {
                ChatRoomId = request.ChatRoomId,
                SenderId = user.UserId,
                Sender = user,
                Content = request.Content.Trim(),
                MessageType = request.MessageType,
                ReplyToMessageId = request.ReplyToMessageId
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            // Update participant's last seen
            await UpdateLastSeenAsync(username, request.ChatRoomId);
            var userMessageResponse = await MapToChatMessageResponseAsync(message, username);
            // Check if this is an AI chat room and generate AI response
            var chatRoom = await _context.ChatRooms.FindAsync(request.ChatRoomId);
            await _hubContext.Clients.Group($"ChatRoom_{request.ChatRoomId}").SendAsync("ReceiveMessage", userMessageResponse);
            if (chatRoom?.ChatType == ChatType.AI)
            {
                await GenerateAndSendAIResponse(request.ChatRoomId, request.Content, user);
            }

            return userMessageResponse;
        }

        public async Task<bool> ClearChatHistoryAsync(int chatRoomId, string username)
        {
            // Verify user has access to chat room
            var hasAccess = await VerifyUserAccessToChatRoomAsync(username, chatRoomId);
            if (!hasAccess)
                return false;

            // Soft delete all messages in the chat room
            var messages = await _context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsDeleted = true;
            }

            _context.ChatMessages.UpdateRange(messages);
            var result = await _context.SaveChangesAsync() > 0;

            if (result)
            {
                // Notify all participants that chat history was cleared
                await _hubContext.Clients.Group($"ChatRoom_{chatRoomId}").SendAsync("ChatHistoryCleared", new
                {
                    ChatRoomId = chatRoomId,
                    ClearedBy = username,
                    ClearedAt = DateTime.Now
                });
            }

            return result;
        }

        private async Task SendAIWelcomeMessage(int chatRoomId, string studentName)
        {
            var welcomeMessage = $@"👋 Xin chào {studentName}!

Tôi là EduBot - trợ lý AI thông minh của Student Management System. Tôi có thể hỗ trợ bạn:

🎓 **Học tập & Nghiên cứu**
• Giải thích các khái niệm học thuật
• Hướng dẫn phương pháp học tập hiệu quả
• Tư vấn về nghiên cứu khoa học

📋 **Thông tin trường học**
• Quy chế, quy định của trường
• Thông tin về chương trình đào tạo
• Các hoạt động sinh viên

💡 **Hỗ trợ khác**
• Tư vấn định hướng nghề nghiệp
• Động viên tinh thần học tập
• Giải đáp thắc mắc chung

Hãy đặt câu hỏi bất cứ lúc nào bạn cần hỗ trợ! 😊";

            var aiMessage = new ChatMessage
            {
                ChatRoomId = chatRoomId,
                SenderId = null, // Special ID for AI
                Content = welcomeMessage,
                MessageType = MessageType.Text,
                SentAt = DateTime.Now
            };

            _context.ChatMessages.Add(aiMessage);
            await _context.SaveChangesAsync();

            // **FIX: Send welcome message via SignalR**
            var welcomeMessageResponse = new ChatMessageResponse
            {
                ChatMessageId = aiMessage.ChatMessageId,
                ChatRoomId = aiMessage.ChatRoomId,
                SenderId = aiMessage.SenderId,
                SenderName = "EduBot",
                SenderRole = "AI Assistant",
                IsCurrentUser = false,
                Content = aiMessage.Content,
                MessageType = aiMessage.MessageType,
                MessageTypeText = GetMessageTypeText(aiMessage.MessageType),
                SentAt = aiMessage.SentAt,
                EditedAt = aiMessage.EditedAt,
                IsDeleted = aiMessage.IsDeleted,
                ReplyToMessageId = aiMessage.ReplyToMessageId,
                ReplyToMessage = null
            };

            await _hubContext.Clients.Group($"ChatRoom_{chatRoomId}").SendAsync("ReceiveMessage", welcomeMessageResponse);
        }

        private async Task GenerateAndSendAIResponse(int chatRoomId, string userMessage, User user)
        {
            try
            {
                //// Notify that AI is typing
                //await _hubContext.Clients.Group($"ChatRoom_{chatRoomId}").SendAsync("UserTyping", new
                //{
                //    Username = "EduBot",
                //    IsTyping = true,
                //    ChatRoomId = chatRoomId
                //});

                // Get recent conversation context (last 5 messages)
                var recentMessages = await _context.ChatMessages
                    .Include(m => m.Sender)
                    .Where(m => m.ChatRoomId == chatRoomId && !m.IsDeleted)
                    .OrderByDescending(m => m.SentAt)
                    .Take(5)
                    .ToListAsync();

                var conversationContext = string.Join("\n", recentMessages
                    .OrderBy(m => m.SentAt)
                    .Select(m => $"{(m.SenderId == null ? "EduBot" : m.Sender?.FullName ?? "Student")}: {m.Content}"));

                // Generate AI response
                var aiResponse = await _geminiAIService.GenerateEducationalResponseAsync(
                    userMessage,
                    user.Username,
                    $"Sinh viên với mã số sinh viên: {user.Username} và tên {user.FullName}\nCuộc trò chuyện gần đây:\n{conversationContext}");

                // Stop typing notification
                //await _hubContext.Clients.Group($"ChatRoom_{chatRoomId}").SendAsync("UserTyping", new
                //{
                //    Username = "EduBot",
                //    IsTyping = false,
                //    ChatRoomId = chatRoomId
                //});

                // Save AI response to database
                var aiMessage = new ChatMessage
                {
                    ChatRoomId = chatRoomId,
                    SenderId = null, // Special ID for AI
                    Content = aiResponse,
                    MessageType = MessageType.Text,
                    SentAt = DateTime.Now
                };

                _context.ChatMessages.Add(aiMessage);
                await _context.SaveChangesAsync();


                // **FIX: Convert to ChatMessageResponse before sending via SignalR**
                var aiMessageResponse = new ChatMessageResponse
                {
                    ChatMessageId = aiMessage.ChatMessageId,
                    ChatRoomId = aiMessage.ChatRoomId,
                    SenderId = aiMessage.SenderId,
                    SenderName = "EduBot",
                    SenderRole = "AI Assistant",
                    IsCurrentUser = false,
                    Content = aiMessage.Content,
                    MessageType = aiMessage.MessageType,
                    MessageTypeText = GetMessageTypeText(aiMessage.MessageType),
                    SentAt = aiMessage.SentAt,
                    EditedAt = aiMessage.EditedAt,
                    IsDeleted = aiMessage.IsDeleted,
                    ReplyToMessageId = aiMessage.ReplyToMessageId,
                    ReplyToMessage = null
                };

                // Send AI message to all users in the chat room
                await _hubContext.Clients.Group($"ChatRoom_{chatRoomId}").SendAsync("ReceiveMessage", aiMessageResponse);

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating AI response: {ex.Message}");
                
                //// Stop typing notification on error
                //await _hubContext.Clients.Group($"ChatRoom_{chatRoomId}").SendAsync("UserTyping", new
                //{
                //    Username = "EduBot",
                //    IsTyping = false,
                //    ChatRoomId = chatRoomId
                //});
                
                // Send error message
                var errorMessage = new ChatMessage
                {
                    ChatRoomId = chatRoomId,
                    SenderId = null,
                    Content = "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau. 😅",
                    MessageType = MessageType.Text,
                    SentAt = DateTime.Now            };

                _context.ChatMessages.Add(errorMessage);
                await _context.SaveChangesAsync();

                // **FIX: Also send error message with correct format**
                var errorMessageResponse = new ChatMessageResponse
                {
                    ChatMessageId = errorMessage.ChatMessageId,
                    ChatRoomId = errorMessage.ChatRoomId,
                    SenderId = errorMessage.SenderId,
                    SenderName = "EduBot",
                    SenderRole = "AI Assistant",
                    IsCurrentUser = false,
                    Content = errorMessage.Content,
                    MessageType = errorMessage.MessageType,
                    MessageTypeText = GetMessageTypeText(errorMessage.MessageType),
                    SentAt = errorMessage.SentAt,
                    EditedAt = errorMessage.EditedAt,
                    IsDeleted = errorMessage.IsDeleted,
                    ReplyToMessageId = errorMessage.ReplyToMessageId,
                    ReplyToMessage = null
                };

                await _hubContext.Clients.Group($"ChatRoom_{chatRoomId}").SendAsync("ReceiveMessage", errorMessageResponse);
            }
        }

        public async Task<PagedResult<ChatMessageResponse>> GetChatMessagesAsync(
            int chatRoomId,
            string username,
            PaginationParams pagination)
        {
            // Verify access
            var hasAccess = await VerifyUserAccessToChatRoomAsync(username, chatRoomId);
            if (!hasAccess)
                throw new Exception("Truy cập vào phòng chat này bị từ chối");

            var query = _context.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.ReplyToMessage)
                    .ThenInclude(rm => rm.Sender)
                .Where(m => m.ChatRoomId == chatRoomId && !m.IsDeleted);

            var totalCount = await query.CountAsync();

            var messages = await query
                .OrderByDescending(m => m.SentAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var responses = new List<ChatMessageResponse>();
            foreach (var message in messages.OrderBy(m => m.SentAt))
            {
                responses.Add(await MapToChatMessageResponseAsync(message, username));
            }

            return new PagedResult<ChatMessageResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<List<ChatRoomResponse>> GetUserChatRoomsAsync(string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username)
                ?? throw new Exception("Không tìm thấy người dùng");

            var chatRooms = await _context.ChatRoomParticipants
                .Include(crp => crp.ChatRoom)
                    .ThenInclude(cr => cr.Class)
                .Include(crp => crp.ChatRoom)
                    .ThenInclude(cr => cr.Department)
                .Where(crp => crp.UserId == user.UserId && crp.IsActive)
                .Select(crp => crp.ChatRoom)
                .ToListAsync();

            var responses = new List<ChatRoomResponse>();
            foreach (var room in chatRooms)
            {
                responses.Add(await MapToChatRoomResponseAsync(room, username));
            }

            return responses.OrderByDescending(r => r.LastMessage?.SentAt).ToList();
        }

        public async Task<bool> VerifyUserAccessToChatRoomAsync(string username, int chatRoomId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null) return false;

            return await _context.ChatRoomParticipants
                .AnyAsync(crp => crp.ChatRoomId == chatRoomId &&
                                crp.UserId == user.UserId &&
                                crp.IsActive);
        }

        public async Task UpdateLastSeenAsync(string username, int chatRoomId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null) return;

            var participant = await _context.ChatRoomParticipants
                .FirstOrDefaultAsync(crp => crp.ChatRoomId == chatRoomId && crp.UserId == user.UserId);

            if (participant != null)
            {
                participant.LastSeenAt = DateTime.Now;
                _context.ChatRoomParticipants.Update(participant);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateUserOfflineStatusAsync(string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null) return;

            var participants = await _context.ChatRoomParticipants
                .Where(crp => crp.UserId == user.UserId && crp.IsActive)
                .ToListAsync();

            foreach (var participant in participants)
            {
                participant.LastSeenAt = DateTime.Now;
            }

            _context.ChatRoomParticipants.UpdateRange(participants);
            await _context.SaveChangesAsync();
        }

        public async Task MarkMessageAsReadAsync(string username, int messageId)
        {
            var message = await _context.ChatMessages
                .FirstOrDefaultAsync(m => m.ChatMessageId == messageId);

            if (message != null)
            {
                await UpdateLastSeenAsync(username, message.ChatRoomId);
            }
        }

        private async Task EnsureUserIsParticipantAsync(int chatRoomId, string username)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null) return;

            var existingParticipant = await _context.ChatRoomParticipants
                .FirstOrDefaultAsync(crp => crp.ChatRoomId == chatRoomId && crp.UserId == user.UserId);

            if (existingParticipant == null)
            {
                // Determine role based on user type
                var role = ParticipantRole.Student; // Default

                if (user.Role.RoleName == "Lecturer" || user.Role.RoleName == "AcademicStaff")
                {
                    role = ParticipantRole.Lecturer;
                }

                await AddParticipantAsync(chatRoomId, username, role);
            }
            else if (!existingParticipant.IsActive)
            {
                existingParticipant.IsActive = true;
                _context.ChatRoomParticipants.Update(existingParticipant);
                await _context.SaveChangesAsync();
            }
        }

        private async Task AddParticipantAsync(int chatRoomId, string username, ParticipantRole role)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null) return;

            var participant = new ChatRoomParticipant
            {
                ChatRoomId = chatRoomId,
                UserId = user.UserId,
                User = user,
                Role = role
            };

            _context.ChatRoomParticipants.Add(participant);
            await _context.SaveChangesAsync();
        }

        private async Task<ChatRoomResponse> MapToChatRoomResponseAsync(ChatRoom chatRoom, string currentUsername)
        {
            var currentUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == currentUsername);

            // Get last message
            var lastMessage = await _context.ChatMessages
                .Include(m => m.Sender)
                .Where(m => m.ChatRoomId == chatRoom.ChatRoomId && !m.IsDeleted)
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefaultAsync();

            // Get unread count for current user
            var participant = await _context.ChatRoomParticipants
                .FirstOrDefaultAsync(crp => crp.ChatRoomId == chatRoom.ChatRoomId && crp.UserId == currentUser.UserId);

            var unreadCount = 0;
            if (participant?.LastSeenAt != null)
            {
                unreadCount = await _context.ChatMessages
                    .CountAsync(m => m.ChatRoomId == chatRoom.ChatRoomId &&
                                   !m.IsDeleted &&
                                   m.SentAt > participant.LastSeenAt &&
                                   m.SenderId != currentUser.UserId);
            }

            // Get participants count
            var totalParticipants = await _context.ChatRoomParticipants
                .CountAsync(crp => crp.ChatRoomId == chatRoom.ChatRoomId && crp.IsActive);

            // Get online count (users who were active in last 5 minutes)
            var onlineThreshold = DateTime.Now.AddMinutes(-5);
            var onlineCount = await _context.ChatRoomParticipants
                .CountAsync(crp => crp.ChatRoomId == chatRoom.ChatRoomId &&
                                  crp.IsActive &&
                                  crp.LastSeenAt != null &&
                                  crp.LastSeenAt > onlineThreshold);

            // Get teacher info based on chat type
            string teacherName = "Unknown";
            if (chatRoom.ChatType == ChatType.ClassTeacher && chatRoom.ClassId.HasValue)
            {
                var classTeacher = await _context.AdviserAssignments
                    .Include(aa => aa.Lecturer)
                        .ThenInclude(l => l.User)
                    .Where(aa => aa.Class.ClassId == chatRoom.ClassId.Value && aa.IsActive)
                    .FirstOrDefaultAsync();

                teacherName = classTeacher?.Lecturer?.User?.FullName ?? "Not Assigned";
            }
            else if (chatRoom.ChatType == ChatType.AcademicStaff)
            {
                teacherName = "Giáo viên Học vụ";
            }
            else if (chatRoom.ChatType == ChatType.AI)
            {
                teacherName = "EduBot - AI Assistant";
            }

            return new ChatRoomResponse
            {
                ChatRoomId = chatRoom.ChatRoomId,
                SectionId = 0, // No longer applicable
                SectionCode = "", // No longer applicable
                CourseCode = "", // No longer applicable
                CourseName = "", // No longer applicable
                RoomName = chatRoom.RoomName,
                Description = chatRoom.Description,
                IsActive = chatRoom.IsActive,
                CreatedAt = chatRoom.CreatedAt,
                LecturerName = teacherName,
                TotalParticipants = totalParticipants,
                OnlineCount = onlineCount,
                LastMessage = lastMessage != null ? await MapToChatMessageResponseAsync(lastMessage, currentUsername) : null,
                UnreadCount = unreadCount,
                ChatType = chatRoom.ChatType.ToString()
            };
        }

        private async Task<ChatMessageResponse> MapToChatMessageResponseAsync(ChatMessage message, string currentUsername)
        {
            var currentUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == currentUsername);

            ChatMessageResponse? replyToMessage = null;
            if (message.ReplyToMessage != null)
            {
                replyToMessage = new ChatMessageResponse
                {
                    ChatMessageId = message.ReplyToMessage.ChatMessageId,
                    SenderName = message.ReplyToMessage.Sender?.FullName ?? "EduBot",
                    Content = message.ReplyToMessage.Content,
                    SentAt = message.ReplyToMessage.SentAt,
                    MessageType = message.ReplyToMessage.MessageType,
                    MessageTypeText = GetMessageTypeText(message.ReplyToMessage.MessageType)
                };
            }

            // Get sender role in this chat room
            var senderParticipant = await _context.ChatRoomParticipants
                .FirstOrDefaultAsync(crp => crp.ChatRoomId == message.ChatRoomId && crp.UserId == message.SenderId);

            string senderName = message.Sender?.FullName ?? "EduBot";
            string senderRole = "AI Assistant";

            if (message.SenderId != null) // Not AI
            {
                senderRole = GetParticipantRoleText(senderParticipant?.Role ?? ParticipantRole.Student);
            }

            return new ChatMessageResponse
            {
                ChatMessageId = message.ChatMessageId,
                ChatRoomId = message.ChatRoomId,
                SenderId = message.SenderId,
                SenderName = senderName,
                SenderRole = senderRole,
                IsCurrentUser = currentUser?.UserId == message.SenderId,
                Content = message.Content,
                MessageType = message.MessageType,
                MessageTypeText = GetMessageTypeText(message.MessageType),
                SentAt = message.SentAt,
                EditedAt = message.EditedAt,
                IsDeleted = message.IsDeleted,
                ReplyToMessageId = message.ReplyToMessageId,
                ReplyToMessage = replyToMessage,
            };
        }

       
        private static string GetMessageTypeText(MessageType messageType)
        {
            return messageType switch
            {
                MessageType.Text => "Text",
                MessageType.Image => "Image",
                MessageType.File => "File",
                MessageType.System => "System",
                _ => "Unknown"
            };
        }

        private static string GetParticipantRoleText(ParticipantRole role)
        {
            return role switch
            {
                ParticipantRole.Lecturer => "Giảng viên",
                ParticipantRole.Student => "Sinh viên",
                ParticipantRole.Assistant => "Trợ giảng",
                _ => "Unknown"
            };
        }
    }
}