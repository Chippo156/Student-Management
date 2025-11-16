using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IUserService
    {
        Task<PagedResult<UserResponse>> GetAllUsersAsync(
            PaginationParams pagination, 
            int? roleId = null, 
            string? search = null);
        Task<UserResponse?> GetUserByIdAsync(int userId);
        Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request);
        Task<UserUpdateResult> UpdateUserWithRoleAsync(int userId, UpdateUserWithRoleRequest request);
        Task<bool> ResetPassword(int userId, ResetPasswordRequest request);
        Task<bool> DeactivateUserAsync(int userId);
        Task<bool> ReactivateUserAsync(int userId);
        Task<UserCreationResult> CreateUserWithRoleAsync(CreateUserWithRoleRequest request);
        Task<User?> UpdateUserAvatarAsync(int userId, string avatarUrl);
        Task<ForgotPasswordByMSSVResponse> ForgotPasswordByMSSVAsync(ForgotPasswordByMSSVRequest request);
    }
}
