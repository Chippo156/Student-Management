using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
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

        public async Task<UserCreationResult> CreateUserWithRoleAsync(CreateUserWithRoleRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                // Validate request
                var validationResult = await ValidateUserCreationRequestAsync(request);
                if (!validationResult.IsValid)
                {
                    return new UserCreationResult
                    {
                        IsSuccess = false,
                        Message = "Validation failed",
                        Errors = validationResult.Errors
                    };
                }
                var role = await context.Roles.FindAsync(request.RoleId);

                // Create User first
                var user = new User
                {
                    Username = request.Username.Trim(),
                    PasswordHash = new PasswordHasher<User>().HashPassword(null!, request.Password),
                    FullName = request.FullName.Trim(),
                    Email = request.Email?.Trim().ToLowerInvariant(),
                    Phone = request.Phone?.Trim(),
                    Address = request.Address?.Trim(),
                    Gender = request.Gender,
                    DateOfBirth = request.DateOfBirth,
                    CitizenIdCard = request.CitizenIdCard?.Trim(),
                    IssuedDate = request.IssuedDate,
                    IssuedPlace = request.IssuedPlace?.Trim(),
                    Role = role,
                    AccountStatus = AccountStatus.Active,

                    // Extended information
                    Ethnicity = request.Ethnicity?.Trim(),
                    Nationality = request.Nationality?.Trim(),
                    HealthInsuranceNumber = request.HealthInsuranceNumber?.Trim(),
                    HealthInsuranceRegistrationPlace = request.HealthInsuranceRegistrationPlace?.Trim(),
                    TemporaryAddress = request.TemporaryAddress?.Trim(),
                    PlaceOfBirth = request.PlaceOfBirth?.Trim(),
                    Religion = request.Religion?.Trim(),

                    // Address details
                    //HometownProvince = request.HometownProvince?.Trim(),
                    //HometownDistrict = request.HometownDistrict?.Trim(),
                    //HometownWard = request.HometownWard?.Trim(),
                    //BirthProvince = request.BirthProvince?.Trim(),
                    //BirthDistrict = request.BirthDistrict?.Trim(),
                    //BirthWard = request.BirthWard?.Trim(),
                    //PermanentProvince = request.PermanentProvince?.Trim(),
                    //PermanentDistrict = request.PermanentDistrict?.Trim(),
                    //PermanentWard = request.PermanentWard?.Trim(),

                    // Additional info
                    Object = request.Object?.Trim(),
                    PolicyArea = request.PolicyArea?.Trim(),
                    DateOfJoinUnion = request.DateOfJoinUnion,
                    DateOfJoinParty = request.DateOfJoinParty
                };

                context.Users.Add(user);
                await context.SaveChangesAsync();

                object? roleSpecificEntity = null;
                string roleSpecificMessage = "";

                // Create role-specific entity based on role
                switch (request.RoleId)
                {
                    case 2:
                        var studentResult = await CreateStudentEntityAsync(user, request.StudentSpecificData!);
                        if (!studentResult.IsSuccess)
                        {
                            await transaction.RollbackAsync();
                            return new UserCreationResult
                            {
                                IsSuccess = false,
                                Message = "Failed to create student entity",
                                Errors = studentResult.Errors
                            };
                        }
                        roleSpecificEntity = studentResult.Student;
                        roleSpecificMessage = $"Student created with MSSV: {studentResult.Student?.MSSV}";
                        break;

                    case 3:
                        var lecturerResult = await CreateLecturerEntityAsync(user, request.LecturerSpecificData!);
                        if (!lecturerResult.IsSuccess)
                        {
                            await transaction.RollbackAsync();
                            return new UserCreationResult
                            {
                                IsSuccess = false,
                                Message = "Failed to create lecturer entity",
                                Errors = lecturerResult.Errors
                            };
                        }
                        roleSpecificEntity = lecturerResult.Lecturer;
                        roleSpecificMessage = $"Lecturer created with code: {lecturerResult.Lecturer?.LecturerCode}";
                        break;

                    case 1:
                        roleSpecificMessage = "Admin user created successfully";
                        break;

                    default:
                        await transaction.RollbackAsync();
                        return new UserCreationResult
                        {
                            IsSuccess = false,
                            Message = "Invalid role specified",
                            Errors = { "Role must be Student, Lecturer, or Admin" }
                        };
                }

                await transaction.CommitAsync();

                return new UserCreationResult
                {
                    IsSuccess = true,
                    Message = $"User created successfully. {roleSpecificMessage}",
                    User = user,
                    RoleSpecificEntity = roleSpecificEntity
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new UserCreationResult
                {
                    IsSuccess = false,
                    Message = "User creation failed due to system error",
                    Errors = { ex.Message }
                };
            }
        }

        private async Task<StudentCreationResult> CreateStudentEntityAsync(User user, StudentSpecificData studentData)
        {
            try
            {
                var mssv = user.Username;
                // Validate student-specific data
                if (string.IsNullOrWhiteSpace(mssv))
                {
                    return new StudentCreationResult
                    {
                        IsSuccess = false,
                        Errors = { "MSSV is required for student" }
                    };
                }

                // Check if MSSV already exists
                var existingStudent = await context.Students.FirstOrDefaultAsync(s => s.MSSV == mssv);
                if (existingStudent != null)
                {
                    return new StudentCreationResult
                    {
                        IsSuccess = false,
                        Errors = { $"Student with MSSV {mssv} already exists" }
                    };
                }

                // Validate class exists
                var studentClass = await context.Classes.FindAsync(studentData.ClassId);
                if (studentClass == null)
                {
                    return new StudentCreationResult
                    {
                        IsSuccess = false,
                        Errors = { "Specified class not found" }
                    };
                }

                var student = new Student
                {
                    User = user,
                    MSSV = mssv.Trim(),
                    Class = studentClass,
                    StudentStatus = studentData.StudentStatus ?? StudentStatus.Active,
                    DateOfAdmission = studentData.AdmissionDate ?? DateOnly.FromDateTime(DateTime.Now),
                    YearOfAdmission = studentData.Year
                };

                context.Students.Add(student);
                await context.SaveChangesAsync();

                // Create family relationships if provided
                //if (studentData.FamilyRelationships?.Any() == true)
                //{
                //    await CreateFamilyRelationshipsAsync(student, studentData.FamilyRelationships);
                //}

                return new StudentCreationResult
                {
                    IsSuccess = true,
                    Student = student
                };
            }
            catch (Exception ex)
            {
                return new StudentCreationResult
                {
                    IsSuccess = false,
                    Errors = { ex.Message }
                };
            }
        }

        private async Task<LecturerCreationResult> CreateLecturerEntityAsync(User user, LecturerSpecificData lecturerData)
        {
            try
            {
                var lecturerCode = user.Username;
                // Validate lecturer-specific data
                if (string.IsNullOrWhiteSpace(lecturerCode))
                {
                    return new LecturerCreationResult
                    {
                        IsSuccess = false,
                        Errors = { "Lecturer code is required" }
                    };
                }

                // Check if lecturer code already exists
                var existingLecturer = await context.Lecturers
                    .FirstOrDefaultAsync(l => l.LecturerCode == lecturerCode);
                if (existingLecturer != null)
                {
                    return new LecturerCreationResult
                    {
                        IsSuccess = false,
                        Errors = { $"Lecturer with code {lecturerCode} already exists" }
                    };
                }

                // Validate department exists
                var department = await context.Departments.FindAsync(lecturerData.DepartmentId);
                if (department == null)
                {
                    return new LecturerCreationResult
                    {
                        IsSuccess = false,
                        Errors = { "Specified department not found" }
                    };
                }

                var lecturer = new Lecturer
                {
                    User = user,
                    LecturerCode = lecturerCode.Trim(),
                    Department = department,
                    Position = lecturerData.Position?.Trim(),
                    AcademicTitle = lecturerData.AcademicTitle?.Trim(),
                };

                context.Lecturers.Add(lecturer);
                await context.SaveChangesAsync();

                return new LecturerCreationResult
                {
                    IsSuccess = true,
                    Lecturer = lecturer
                };
            }
            catch (Exception ex)
            {
                return new LecturerCreationResult
                {
                    IsSuccess = false,
                    Errors = { ex.Message }
                };
            }
        }

        private async Task CreateFamilyRelationshipsAsync(Student student, List<FamilyRelationshipData> familyData)
        {
            foreach (var familyMember in familyData)
            {
                var relationship = new FamilyRelationship
                {
                    Student = student,
                    FullName = familyMember.FullName.Trim(),
                    RelationshipType = familyMember.RelationshipType,
                    DateOfBirth = familyMember.DateOfBirth,
                    Phone = familyMember.Phone?.Trim(),
                    Email = familyMember.Email?.Trim(),
                    Occupation = familyMember.Occupation?.Trim(),
                    Workplace = familyMember.Workplace?.Trim(),
                    CitizenIdCard = familyMember.CitizenIdCard?.Trim(),
                    IssuedDate = familyMember.IssuedDate,
                    IssuedPlace = familyMember.IssuedPlace?.Trim(),
                    Province = familyMember.Province?.Trim(),
                    District = familyMember.District?.Trim(),
                    Ward = familyMember.Ward?.Trim(),
                    DetailAddress = familyMember.DetailAddress?.Trim(),
                    IsGuardian = familyMember.IsGuardian,
                    IsDeceased = familyMember.IsDeceased,
                    IsHouseholder = familyMember.IsHouseholder
                };

                context.FamilyRelationships.Add(relationship);
            }

            await context.SaveChangesAsync();
        }

        private async Task<(bool IsValid, List<string> Errors)> ValidateUserCreationRequestAsync(CreateUserWithRoleRequest request)
        {
            var errors = new List<string>();

            // Basic validation
            if (string.IsNullOrWhiteSpace(request.Username))
                errors.Add("Username is required");

            if (string.IsNullOrWhiteSpace(request.Password))
                errors.Add("Password is required");

            if (string.IsNullOrWhiteSpace(request.FullName))
                errors.Add("Full name is required");

            // Check username uniqueness
            if (!string.IsNullOrWhiteSpace(request.Username))
            {
                var existingUser = await context.Users
                    .FirstOrDefaultAsync(u => u.Username == request.Username);
                if (existingUser != null)
                {
                    errors.Add("Username already exists");
                }
            }

            // Check email uniqueness
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var existingEmail = await context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingEmail != null)
                {
                    errors.Add("Email already exists");
                }
            }

            // Check citizen ID uniqueness
            if (!string.IsNullOrWhiteSpace(request.CitizenIdCard))
            {
                var existingCitizenId = await context.Users
                    .FirstOrDefaultAsync(u => u.CitizenIdCard == request.CitizenIdCard);
                if (existingCitizenId != null)
                {
                    errors.Add("Citizen ID card already exists");
                }
            }

            // Role-specific validation
            switch (request.RoleId)
            {
                case 2:
                    if (request.StudentSpecificData == null)
                        errors.Add("Student specific data is required for student role");
                    break;

                case 3:
                    if (request.LecturerSpecificData == null)
                        errors.Add("Lecturer specific data is required for lecturer role");
                    break;
            }

            return (errors.Count == 0, errors);
        }

    }
}
