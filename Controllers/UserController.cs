using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Runtime.InteropServices;

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
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            var user = await userService.GetUserByIdAsync(id);
            if (user is null)
            {
                return NotFound($"User with ID {id} not found.");
            }
            return Ok(user);
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<User>> UpdateUser(int id, UserRequest user)
        {
            var updatedUser = await userService.UpdateUserAsync(id, user);
            if (updatedUser is null)
            {
                return NotFound($"User with ID {id} not found.");
            }
            return Ok(updatedUser);
        }
    }
}
