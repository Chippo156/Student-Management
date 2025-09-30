using AuthProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        public static User user = new User();

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserRequest request)
        {
            var user = await authService.RegisterAsync(request);
            if (user is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Register failed", null));
            }
            return Ok(ApiResponse.SuccessResponse(user, "Success"));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginRequest request)
        {
            var loginResponse = await authService.LoginAsync(request);
            if (loginResponse == null)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid username or password.", null));
            }
            return Ok(ApiResponse.SuccessResponse(loginResponse, "Login success"));
        }

        [Authorize]
        [HttpGet]
        public IActionResult AuthenticatedOnlyEndpoint()
        {
            return Ok(ApiResponse.SuccessResponse("You are authenticated !", "Authentication verified"));
        }

        [HttpPost]
        [Route("refresh-token")]
        public async Task<ActionResult<TokenResponse>> RefreshToken(RefreshTokenRequest refreshTokenRequest)
        {
            var result = await authService.RefreshTokenAsync(refreshTokenRequest);
            if (result is null)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid refresh token.", null));
            }
            return Ok(ApiResponse.SuccessResponse(result, "Refresh token success"));
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            if (User.Identity is not { IsAuthenticated: true })
            {
                return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "User is not authenticated.", null));
            }
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdStr, out int userId))
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user ID in token.", null));
            }
            var result = await authService.LogoutAsync(userId);
            if (!result)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Logout failed.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Logout successful."));
        }

    }
}
