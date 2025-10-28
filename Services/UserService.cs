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

        public async Task<PagedResult<UserResponse>> GetAllUsersAsync(PaginationParams pagination)
        {
            var query = context.Users
                .Include(u => u.Role)
                .Include(u => u.BankAccounts.Where(ba => ba.IsDefault))
                .OrderBy(u => u.FullName) // Sắp xếp cho ổn định, có thể đổi thành CreatedDate
                .AsQueryable();

            // Tổng số bản ghi
            var totalCount = await query.CountAsync();

            // Lấy trang hiện tại
            var users = await query
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Map sang DTO
            var userResponses = users.Select(ToUserResponse).ToList();

            // Gói kết quả vào PagedResult
            return new PagedResult<UserResponse>
            {
                Items = userResponses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }


        // Thêm method helper để map User to UserResponse
        private static UserResponse ToUserResponse(User user)
        {
            var defaultBankAccount = user.BankAccounts?.FirstOrDefault(ba => ba.IsDefault == true);

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Phone = user.Phone ?? string.Empty,
                Address = user.Address ?? string.Empty,
                TemporaryAddress = user.TemporaryAddress,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                PlaceOfBirth = user.PlaceOfBirth,
                Religion = user.Religion,
                DateOfBirth = user.DateOfBirth,
                CitizenIdCard = user.CitizenIdCard ?? string.Empty,
                IssuedDate = user.IssuedDate,
                IssuedPlace = user.IssuedPlace ?? string.Empty,
                Object = user.Object ?? string.Empty,
                PolicyArea = user.PolicyArea,
                DateOfJoinUnion = user.DateOfJoinUnion,
                DateOfJoinParty = user.DateOfJoinParty,
                Ethnicity = user.Ethnicity,
                Nationality = user.Nationality,
                HometownProvince = user.HometownProvince,
                HometownDistrict = user.HometownDistrict,
                HometownWard = user.HometownWard,
                BirthProvince = user.BirthProvince,
                BirthDistrict = user.BirthDistrict,
                BirthWard = user.BirthWard,
                BirthCertProvince = user.BirthCertProvince,
                BirthCertDistrict = user.BirthCertDistrict,
                BirthCertWard = user.BirthCertWard,
                PermanentProvince = user.PermanentProvince,
                PermanentDistrict = user.PermanentDistrict,
                PermanentWard = user.PermanentWard,
                HealthInsuranceNumber = user.HealthInsuranceNumber,
                HealthInsuranceRegistrationPlace = user.HealthInsuranceRegistrationPlace,
                AccountStatus = user.AccountStatus,
                Role = user.Role,
                BankAccount = defaultBankAccount != null ? new BankAccountResponse
                {
                    Id = defaultBankAccount.Id,
                    UserId = user.UserId,
                    AccountNumber = defaultBankAccount.AccountNumber,
                    BankName = defaultBankAccount.BankName,
                    BankCode = defaultBankAccount.BankCode,
                    Branch = defaultBankAccount.Branch,
                    AccountHolderName = defaultBankAccount.AccountHolderName,
                    IsDefault = defaultBankAccount.IsDefault == true,
                    AccountStatus = defaultBankAccount.AccountStatus,
                    DateCreateAccount = defaultBankAccount.DateCreateAccount
                } : null
            };
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
