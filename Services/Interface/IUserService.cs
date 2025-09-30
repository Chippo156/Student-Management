using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IUserService
    {
        Task<UserResponse?> GetUserByIdAsync(int userId);
        Task<IEnumerable<UserResponse>> GetAllUsersAsync();
        Task<UserResponse?> UpdateUserAsync(int userId, UpdateUserRequest user);
        Task<bool> ResetPassword(int userId, string newPassword);
    }
}
