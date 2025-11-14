using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Enum;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementController(IAnnouncementService announcementService) : ControllerBase
    {
        [HttpPost("CreateAnnouncement")]
        [Authorize(Roles = "Admin,Lecturer")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementRequest request)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (username == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user in token.", null));
                }

                var announcement = await announcementService.CreateAnnouncementAsync(request, username);
                return Ok(ApiResponse.SuccessResponse(announcement, "Announcement created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnnouncementById(int id)
        {
            var announcement = await announcementService.GetAnnouncementByIdAsync(id);
            if (announcement == null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Announcement with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(announcement, "Announcement retrieved successfully"));
        }

        [HttpGet("GetMyAnnouncements")]
        [Authorize]
        public async Task<IActionResult> GetMyAnnouncements(
            [FromQuery] PaginationParams pagination,
            [FromQuery] AnnouncementType? type = null,
            [FromQuery] AnnouncementPriority? priority = null,
            [FromQuery] bool? onlyActive = true)
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (username == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user in token.", null));
                }

                var result = await announcementService.GetAnnouncementsForUserAsync(
                    username, pagination, type, priority, onlyActive);
                return Ok(ApiResponse.SuccessResponse(result, "User announcements retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving announcements", new List<string> { ex.Message }));
            }
        }

        [HttpGet("GetAllAnnouncements")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAnnouncements(
            [FromQuery] PaginationParams pagination,
            [FromQuery] string? search = null,
            [FromQuery] AnnouncementType? type = null,
            [FromQuery] AnnouncementPriority? priority = null,
            [FromQuery] AnnouncementTargetType? targetType = null,
            [FromQuery] bool? isActive = null)
        {
            try
            {
                var result = await announcementService.GetAllAnnouncementsAsync(
                    pagination, search, type, priority, targetType, isActive);
                return Ok(ApiResponse.SuccessResponse(result, "All announcements retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving announcements", new List<string> { ex.Message }));
            }
        }

        [HttpGet("GetUnreadCount")]
        [Authorize]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var username = User.FindFirstValue(ClaimTypes.Name);
                if (username == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user in token.", null));
                }

                var count = await announcementService.GetUnreadCountForUserAsync(username);
                return Ok(ApiResponse.SuccessResponse(new { UnreadCount = count }, "Unread count retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving unread count", new List<string> { ex.Message }));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Lecturer")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] AnnouncementRequest request)
        {
            try
            {
                var updatedAnnouncement = await announcementService.UpdateAnnouncementAsync(id, request);
                if (updatedAnnouncement == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Announcement with ID {id} not found", null));
                }
                return Ok(ApiResponse.SuccessResponse(updatedAnnouncement, "Announcement updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var result = await announcementService.DeleteAnnouncementAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Announcement with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Announcement deleted successfully"));
        }
    }
}