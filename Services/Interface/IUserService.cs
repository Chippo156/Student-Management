using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IUserService
    {
        Task<UserResponse?> GetUserByIdAsync(int userId);
        Task<PagedResult<UserResponse>> GetAllUsersAsync(PaginationParams pagination);
        Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request);
        Task<bool> ResetPassword(int userId, string newPassword);
    }
}
