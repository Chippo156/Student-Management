using AuthProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Collections.Generic;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService, IUserService userService, IStudentService studentService, ILecturerService lecturerService) : ControllerBase
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
        [AllowAnonymous]
        public async Task<ActionResult<TokenResponse>> RefreshToken(RefreshTokenRequest refreshTokenRequest)
        {
            var result = await authService.RefreshTokenAsync(refreshTokenRequest);
            if (result is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Refresh token failed", null));
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

        [HttpGet("GetCurrentUserByToken")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                // 1️⃣ Lấy thông tin cơ bản từ token
                var username = User.FindFirstValue(ClaimTypes.Name);
                var role = User.FindFirstValue(ClaimTypes.Role);

                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "Invalid token", null));
                }

                object? userInfo = null;

                // 2️⃣ Xử lý theo role
                switch (role)
                {
                    case "Student":
                        userInfo = await studentService.GetStudentByMSSV(username);
                        break;

                    case "Lecturer":
                        userInfo = await lecturerService.GetLecturerDetailByCodeAsync(username);
                        break;

                    case "Admin":
                        userInfo = await authService.GetCurrentUserAsync(username);
                        break;

                    default:
                        return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, $"Unsupported role: {role}", null));
                }

                // 3️⃣ Kiểm tra kết quả
                if (userInfo == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "User not found", null));
                }

                // 4️⃣ Trả kết quả thành công
                return Ok(ApiResponse.SuccessResponse(userInfo, "User information retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("forgot-password-by-mssv")]
        public async Task<IActionResult> ForgotPasswordByMSSV([FromBody] ForgotPasswordByMSSVRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid request data", errors));
                }

                var result = await userService.ForgotPasswordByMSSVAsync(request);
                
                if (result.IsSuccess)
                {
                    return Ok(ApiResponse.SuccessResponse(new { 
                        message = result.Message,
                        studentName = result.StudentName,
                        email = result.Email
                    }, result.Message));
                }
                else
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, result.Message, result.Errors));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while processing forgot password request", new List<string> { ex.Message }));
            }
        }
    }
}
