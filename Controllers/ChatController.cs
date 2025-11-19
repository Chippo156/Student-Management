using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController(IChatService chatService) : ControllerBase
    {
        [HttpPost("class-teacher")]
        public async Task<IActionResult> GetOrCreateChatWithClassTeacher()
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid user", null));
                }

                var chatRoom = await chatService.GetOrCreateChatRoomWithClassTeacherAsync(username);
                return Ok(ApiResponse.SuccessResponse(chatRoom, "Chat room with class teacher retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("academic-staff")]
        public async Task<IActionResult> GetOrCreateChatWithAcademicStaff()
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid user", null));
                }

                var chatRoom = await chatService.GetOrCreateChatRoomWithAcademicStaffAsync(username);
                return Ok(ApiResponse.SuccessResponse(chatRoom, "Chat room with academic staff retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid user", null));
                }

                var message = await chatService.SendMessageAsync(request, username);
                return Ok(ApiResponse.SuccessResponse(message, "Message sent successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("{chatRoomId}/messages")]
        public async Task<IActionResult> GetMessages(
            int chatRoomId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid user", null));
                }

                var pagination = new PaginationParams { PageNumber = pageNumber, PageSize = pageSize };
                var messages = await chatService.GetChatMessagesAsync(chatRoomId, username, pagination);
                return Ok(ApiResponse.SuccessResponse(messages, "Messages retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("my-rooms")]
        public async Task<IActionResult> GetMyChatRooms()
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid user", null));
                }

                var rooms = await chatService.GetUserChatRoomsAsync(username);
                return Ok(ApiResponse.SuccessResponse(rooms, "Chat rooms retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("{chatRoomId}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int chatRoomId)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid user", null));
                }

                await chatService.UpdateLastSeenAsync(username, chatRoomId);
                return Ok(ApiResponse.SuccessResponse(null, "Messages marked as read"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}