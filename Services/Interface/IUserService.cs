using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(int userId);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> UpdateUserAsync(int userId, UserRequest user);
    }
}
