using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _context;

        public ChatService(AppDbContext context)
        {
            _context = context;
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

             

            // Tìm room đã tồn tại
            var existingRoom = await _context.ChatRooms
                .Include(cr => cr.Class)
                .FirstOrDefaultAsync(cr => cr.ChatType == ChatType.ClassTeacher &&
                                          cr.ClassId == student.Class.ClassId);

            if (existingRoom != null)
            {
                // Ensure user is participant
                await EnsureUserIsParticipantAsync(existingRoom.ChatRoomId, studentUsername);
                return await MapToChatRoomResponseAsync(existingRoom, studentUsername);
            }

            // Tạo room mới
            var chatRoom = new ChatRoom
            {
                ChatType = ChatType.ClassTeacher,
                ClassId = student.Class.ClassId,
                Class = student.Class,
                RoomName = $"Lớp {student.Class.ClassName} - GV Chủ nhiệm",
                Description = $"Chat với giảng viên chủ nhiệm lớp {student.Class.ClassName}"
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // Add class teacher as participant
            await AddParticipantAsync(chatRoom.ChatRoomId, classTeacher.Lecturer.User.Username, ParticipantRole.Lecturer);

            // Add requesting student as participant
            await EnsureUserIsParticipantAsync(chatRoom.ChatRoomId, studentUsername);

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
                .Include(cr => cr.Department)
                .FirstOrDefaultAsync(cr => cr.ChatType == ChatType.AcademicStaff &&
                                          cr.DepartmentId == student.Class.Program.Department.DepartmentId);

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
                RoomName = $"Học vụ - {student.Class.Program.Department.DepartmentName}",
                Description = $"Chat với giáo viên học vụ khoa {student.Class.Program.Department.DepartmentName}"
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            // Add academic staff as participants (all lecturers with AcademicStaff role in this department)
            var academicStaffs = await _context.Lecturers
                .Include(l => l.User)
                    .ThenInclude(u => u.Role)
                .Where(l => l.Department.DepartmentId == student.Class.Program.Department.DepartmentId &&
                           l.User.Role.RoleName == "AcademicStaff")
                .ToListAsync();

            foreach (var staff in academicStaffs)
            {
                await AddParticipantAsync(chatRoom.ChatRoomId, staff.User.Username, ParticipantRole.Lecturer);
            }

            // Add requesting student as participant
            await EnsureUserIsParticipantAsync(chatRoom.ChatRoomId, studentUsername);

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

            return await MapToChatMessageResponseAsync(message, username);
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
                participant.LastSeenAt = DateTime.UtcNow;
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
                participant.LastSeenAt = DateTime.UtcNow;
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
            var onlineThreshold = DateTime.UtcNow.AddMinutes(-5);
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
                    SenderName = message.ReplyToMessage.Sender.FullName,
                    Content = message.ReplyToMessage.Content,
                    SentAt = message.ReplyToMessage.SentAt,
                    MessageType = message.ReplyToMessage.MessageType,
                    MessageTypeText = GetMessageTypeText(message.ReplyToMessage.MessageType)
                };
            }

            // Get sender role in this chat room
            var senderParticipant = await _context.ChatRoomParticipants
                .FirstOrDefaultAsync(crp => crp.ChatRoomId == message.ChatRoomId && crp.UserId == message.SenderId);

            return new ChatMessageResponse
            {
                ChatMessageId = message.ChatMessageId,
                ChatRoomId = message.ChatRoomId,
                SenderId = message.SenderId,
                SenderName = message.Sender.FullName,
                SenderRole = GetParticipantRoleText(senderParticipant?.Role ?? ParticipantRole.Student),
                IsCurrentUser = currentUser?.UserId == message.SenderId,
                Content = message.Content,
                MessageType = message.MessageType,
                MessageTypeText = GetMessageTypeText(message.MessageType),
                SentAt = message.SentAt,
                EditedAt = message.EditedAt,
                IsDeleted = message.IsDeleted,
                ReplyToMessageId = message.ReplyToMessageId,
                ReplyToMessage = replyToMessage
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