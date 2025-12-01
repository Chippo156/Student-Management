using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IUserService userService) : BaseController
    {
        public static User user = new User();

        [HttpGet("GetAllUsers")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers([FromQuery] PaginationParams pagination, [FromQuery] int? roleId, [FromQuery] string? search)
        {
            var result = await userService.GetAllUsersAsync(pagination, roleId, search);
            return Ok(ApiResponse.SuccessResponse(result, "Danh sách người dùng"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            var user = await userService.GetUserByIdAsync(id);
            if (user is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"User with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(user, "User retrieved successfully"));
        }

        [HttpPut("Update/{id}")]
        [Authorize]
        public async Task<ActionResult<User>> UpdateUser(int id, [FromForm] UpdateUserRequest request)
        {
            try
            {
                // Kiểm tra quyền: chỉ admin hoặc chính user đó mới có thể cập nhật
                var currentUserId = GetAuthenticatedUserId();
                var role = User.FindFirstValue(ClaimTypes.Role);

                if (currentUserId.UserId != id && role != "Admin")
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Not role admin ", null));

                }

                // Validate request
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid input data.", errors));
                }

                var updatedUser = await userService.UpdateUserAsync(id, request);

                if (updatedUser is null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"User with ID {id} not found.", null));
                }

                return Ok(ApiResponse.SuccessResponse(updatedUser, "User updated successfully"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponse.ErrorResponse(ErrorCodes.Conflict, ex.Message, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while updating user.", new List<string> { ex.Message }));
            }
        }

        [HttpPut("ResetPassword")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var currentUserId = GetAuthenticatedUserId();
            var id = currentUserId.UserId;
            var result = await userService.ResetPassword(id, request);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Đặt lại mật khẩu không thành công", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Password reset successfully"));
        }
        [HttpPost("create-with-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUserWithRole([FromBody] CreateUserWithRoleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid input data", errors));
                }

                var result = await userService.CreateUserWithRoleAsync(request);

                if (!result.IsSuccess)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, result.Message, result.Errors));
                }

                return Ok(ApiResponse.SuccessResponse(new
                {
                    User = result.User,
                    RoleSpecificEntity = result.RoleSpecificEntity,
                    Message = result.Message
                }, "User created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while creating user", new List<string> { ex.Message }));
            }
        }
        [HttpPut("update-with-role/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserWithRole(int id, [FromBody] UpdateUserWithRoleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid input data", errors));
                }

                var result = await userService.UpdateUserWithRoleAsync(id, request);

                if (!result.IsSuccess)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, result.Message, result.Errors));
                }

                return Ok(ApiResponse.SuccessResponse(new
                {
                    User = result.User,
                    RoleSpecificEntity = result.RoleSpecificEntity,
                    Message = result.Message
                }, "User updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while updating user", new List<string> { ex.Message }));
            }
        }
        [HttpPut("deactivate/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            try
            {
                var result = await userService.DeactivateUserAsync(id);

                if (!result)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "User not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(null, "User account deactivated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while deactivating user", new List<string> { ex.Message }));
            }
        }

        [HttpPut("reactivate/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReactivateUser(int id)
        {
            try
            {
                var result = await userService.ReactivateUserAsync(id);

                if (!result)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "User not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(null, "User account reactivated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while reactivating user", new List<string> { ex.Message }));
            }
        }

        [HttpPost("UpdateAvatarUser")]
        [Authorize]
        public async Task<IActionResult> UpdateAvatarUser(string AvatarUrl)
        {
            try
            {
                var currentUserId = GetAuthenticatedUserId();
                var updatedUser = await userService.UpdateUserAvatarAsync(currentUserId.UserId, AvatarUrl);
                if (updatedUser is null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"User with ID {currentUserId.UserId} not found.", null));
                }
                return Ok(ApiResponse.SuccessResponse(updatedUser, "User avatar updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while updating user avatar.", new List<string> { ex.Message }));
            }
        }
    } 
}
