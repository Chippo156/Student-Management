using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IUserService
    {
        Task<PagedResult<UserResponse>> GetAllUsersAsync(PaginationParams pagination);
        Task<UserResponse?> GetUserByIdAsync(int userId);
        Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request);
        Task<bool> ResetPassword(int userId, string newPassword);
        Task<UserCreationResult> CreateUserWithRoleAsync(CreateUserWithRoleRequest request);
    }
}
