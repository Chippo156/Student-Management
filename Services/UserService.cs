using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class UserService(AppDbContext context) : IUserService
    {
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await context.Users.FindAsync(userId);
        }

        public Task<User?> UpdateUserAsync(int userId, UserRequest user)
        {
            var existingUser = context.Users.Find(userId);
            if (existingUser is null) return Task.FromResult<User?>(null);
            existingUser.FullName = user.FullName;
            existingUser.Email = user.Email;
            existingUser.Phone = user.Phone;
            existingUser.Address = user.Address;
            existingUser.Gender = user.Gender;
            context.Users.Update(existingUser);
            context.SaveChanges();
            return Task.FromResult<User?>(existingUser);

        }
    }
}
