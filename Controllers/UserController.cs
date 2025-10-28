using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IUserService userService) : ControllerBase
    {
        public static User user = new User();

        [HttpGet("GetAllUsers")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers([FromQuery] PaginationParams pagination)
        {
            var result = await userService.GetAllUsersAsync(pagination);
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
        public async Task<ActionResult<User>> UpdateUser(int id, [FromForm] UpdateUserRequest user)
        {
            var updatedUser = await userService.UpdateUserAsync(id, user);
            if (updatedUser is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"User with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedUser, "User updated successfully"));
        }
        [HttpPut("ResetPassword/{id}")]
        public async Task<ActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
        {
            var result = await userService.ResetPassword(id, request.NewPassword);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"User with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Password reset successfully"));
        }
    }
}
