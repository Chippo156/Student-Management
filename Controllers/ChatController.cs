using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet("GetMyChatRooms")]
        public async Task<IActionResult> GetMyChatRooms()
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (username == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user in token.", null));
                }

                var chatRooms = await _chatService.GetUserChatRoomsAsync(username);
                return Ok(ApiResponse.SuccessResponse(chatRooms, "Chat rooms retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving chat rooms", new List<string> { ex.Message }));
            }
        }

        [HttpPost("JoinSectionChat/{sectionId}")]
        public async Task<IActionResult> JoinSectionChat(int sectionId)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (username == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user in token.", null));
                }

                var chatRoom = await _chatService.GetOrCreateChatRoomForSectionAsync(sectionId, username);
                return Ok(ApiResponse.SuccessResponse(chatRoom, "Joined chat room successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("GetMessages/{chatRoomId}")]
        public async Task<IActionResult> GetChatMessages(
            int chatRoomId,
            [FromQuery] PaginationParams pagination)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (username == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user in token.", null));
                }

                var messages = await _chatService.GetChatMessagesAsync(chatRoomId, username, pagination);
                return Ok(ApiResponse.SuccessResponse(messages, "Messages retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (username == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user in token.", null));
                }

                var message = await _chatService.SendMessageAsync(request, username);
                return Ok(ApiResponse.SuccessResponse(message, "Message sent successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}