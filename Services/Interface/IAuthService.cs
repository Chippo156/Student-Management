
using AuthProject.Models;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(UserLoginRequest request);
        Task<bool> LogoutAsync(int userId);
        Task<User?> RegisterAsync(UserRequest request);

        Task<TokenResponse?> RefreshTokenAsync(RefreshTokenRequest refreshTokenRequestDto);
    }
}   
