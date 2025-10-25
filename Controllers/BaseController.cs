using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    public class BaseController : ControllerBase
    {
        protected (bool IsValid, IActionResult? ErrorResult, int UserId) GetAuthenticatedUserId()
        {
            if (User.Identity is not { IsAuthenticated: true })
            {
                var error = Unauthorized(ApiResponse.ErrorResponse(
                    ErrorCodes.Unauthorized,
                    "User is not authenticated.",
                    null
                ));
                return (false, error, 0);
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdStr, out int userId))
            {
                var error = BadRequest(ApiResponse.ErrorResponse(
                    ErrorCodes.BadRequest,
                    "Invalid user ID in token.",
                    null
                ));
                return (false, error, 0);
            }

            return (true, null, userId);
        }
    }
}
