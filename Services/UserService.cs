using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class UserService(AppDbContext context, IFileService fileService) : IUserService
    {

        public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
        {
            return await context.Users
                .Select(u => new UserResponse
                {
                    Username = u.Username,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    AccountStatus = u.AccountStatus,
                    AvatarUrl = u.AvatarUrl,
                    Role = u.Role
                })
                .ToListAsync();
        }

        public async Task<UserResponse?> GetUserByIdAsync(int userId)
        {
            return await context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new UserResponse
                {
                    Username = u.Username,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    AccountStatus = u.AccountStatus,
                    AvatarUrl = u.AvatarUrl,
                    Role = u.Role
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ResetPassword(int userId, string newPassword)
        {
            User? user= await context.Users.FindAsync(userId);
            if (user is null) return false;
            var hashedPassword = new PasswordHasher<User>()
                 .HashPassword(user, newPassword);
            user.PasswordHash = hashedPassword;
            context.Users.Update(user);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<UserResponse?> UpdateUserAsync(int userId, UpdateUserRequest user)
        {
            var existingUser = await context.Users.FindAsync(userId);
            if (existingUser is null) return null;
            existingUser.FullName = user.FullName;
            existingUser.Email = user.Email;
            existingUser.Phone = user.Phone;
            existingUser.Address = user.Address;
            existingUser.Gender = user.Gender;

            if (user.AvatarUrl is not null)
            {
                FileRequest fileRequest = new FileRequest
                {
                    File = user.AvatarUrl,
                    UploadedByUserId = userId
                };
                FileResponse file = await fileService.UploadFileAsync(fileRequest, "avatars");
                existingUser.AvatarUrl = file.FilePath;
                // You may want to update existingUser.AvatarPath or similar here if needed
            }
            context.Users.Update(existingUser);
            await context.SaveChangesAsync();
            return new UserResponse
            {
                Username = existingUser.Username,
                FullName = existingUser.FullName,
                Email = existingUser.Email,
                Phone = existingUser.Phone,
                Address = existingUser.Address,
                AccountStatus = existingUser.AccountStatus,
                AvatarUrl = existingUser.AvatarUrl,
                Role = existingUser.Role
            };
        }
    }
}
