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

        public async Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var user = await context.Users.FindAsync(userId);
                if (user == null)
                {
                    return null;
                }

                // Kiểm tra email trùng lặp (nếu có thay đổi)
                if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
                {
                    var emailExists = await context.Users
                        .AnyAsync(u => u.Email == request.Email && u.UserId != userId);

                    if (emailExists)
                    {
                        throw new InvalidOperationException("Email address is already in use by another user");
                    }
                }

                // Kiểm tra CMND/CCCD trùng lặp (nếu có thay đổi)
                if (!string.IsNullOrEmpty(request.CitizenIdCard) && request.CitizenIdCard != user.CitizenIdCard)
                {
                    var citizenIdExists = await context.Users
                        .AnyAsync(u => u.CitizenIdCard == request.CitizenIdCard && u.UserId != userId);

                    if (citizenIdExists)
                    {
                        throw new InvalidOperationException("Citizen ID card is already in use by another user");
                    }
                }

                // Xử lý upload avatar
                string? avatarUrl = user.AvatarUrl;
                if (request.AvatarFile != null)
                {
                    try
                    {
                        // Xóa avatar cũ nếu có
                        //if (!string.IsNullOrEmpty(user.AvatarUrl))
                        //{
                        //    await fileService.DeleteFileAsync(user.AvatarUrl);
                        //}

                        // Upload avatar mới
                        //avatarUrl = await fileService.UploadFileAsync(request.AvatarFile, "avatars");
                    }
                    catch (Exception ex)
                    {
                        throw new InvalidOperationException($"Failed to upload avatar: {ex.Message}");
                    }
                }

                // Cập nhật thông tin user
                user.FullName = request.FullName.Trim();
                user.Gender = request.Gender;
                user.DateOfBirth = request.DateOfBirth;
                user.Ethnicity = request.Ethnicity?.Trim();
                user.Nationality = request.Nationality?.Trim();
                user.CitizenIdCard = request.CitizenIdCard?.Trim();
                user.IssuedDate = request.IssuedDate;
                user.IssuedPlace = request.IssuedPlace?.Trim();
                user.HealthInsuranceNumber = request.HealthInsuranceNumber?.Trim();
                user.HealthInsuranceRegistrationPlace = request.HealthInsuranceRegistrationPlace?.Trim();
                user.Email = request.Email?.Trim().ToLowerInvariant();
                user.Phone = request.Phone?.Trim();
                user.Address = request.Address?.Trim();
                user.TemporaryAddress = request.TemporaryAddress?.Trim();
                user.PlaceOfBirth = request.PlaceOfBirth?.Trim();
                user.Religion = request.Religion?.Trim();
                user.AvatarUrl = avatarUrl ?? user.AvatarUrl;



                // Cập nhật thông tin mở rộng
                user.Object = request.Object?.Trim();
                user.PolicyArea = request.PolicyArea?.Trim();
                user.DateOfJoinUnion = request.DateOfJoinUnion;
                user.DateOfJoinParty = request.DateOfJoinParty;

                context.Users.Update(user);
                await  context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Log 
                return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }



    }
}
