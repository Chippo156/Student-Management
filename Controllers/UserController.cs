using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IUserService userService) : ControllerBase
    {
        public static User user = new User();

        [HttpGet("GetAllUsers")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await userService.GetAllUsersAsync();
            return Ok(ApiResponse.SuccessResponse(users, "Users retrieved successfully"));
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
    }
}
