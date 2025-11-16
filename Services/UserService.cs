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
    public class UserService(AppDbContext context, IFileService fileService, IEmailService emailService) : IUserService
    {

        public async Task<PagedResult<UserResponse>> GetAllUsersAsync(
    PaginationParams pagination,
    int? roleId = null,
    string? search = null)
        {
            var query = context.Users
                .Include(u => u.Role)
                .Include(u => u.BankAccounts.Where(ba => ba.IsDefault))
                .AsQueryable();

            // Apply role filter
            if (roleId.HasValue && roleId.Value > 0)
            {
                query = query.Where(u => u.Role.RoleId == roleId.Value);
            }

            // Apply search filter for name and email
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(searchTerm) ||
                    (u.Email != null && u.Email.ToLower().Contains(searchTerm)) ||
                    u.Username.ToLower().Contains(searchTerm));
            }

            // Order by full name for stable sorting
            query = query.OrderBy(u => u.FullName);

            // Get total count after applying filters
            var totalCount = await query.CountAsync();

            // Apply pagination
            var users = await query
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var userResponses = users.Select(ToUserResponse).ToList();

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

        public async Task<bool> ResetPassword(int userId, ResetPasswordRequest request)
        {
            User? user= await context.Users.FindAsync(userId);
            if (user is null) return false;
            if (user.PasswordHash != request.OldPassword) return false;
            if (request.NewPassword != request.ConfirmPassword) return false;
            user.PasswordHash = request.NewPassword;
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
                    PasswordHash = request.Password,
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
        public async Task<UserUpdateResult> UpdateUserWithRoleAsync(int userId, UpdateUserWithRoleRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var user = await context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                {
                    return new UserUpdateResult
                    {
                        IsSuccess = false,
                        Message = "User not found",
                        Errors = { "User with provided ID does not exist" }
                    };
                }

                // Validate request
                var validationResult = await ValidateUserUpdateRequestAsync(userId, request);
                if (!validationResult.IsValid)
                {
                    return new UserUpdateResult
                    {
                        IsSuccess = false,
                        Message = "Validation failed",
                        Errors = validationResult.Errors
                    };
                }

                // Get new role if different
                var newRole = await context.Roles.FindAsync(request.RoleId);
                if (newRole == null)
                {
                    return new UserUpdateResult
                    {
                        IsSuccess = false,
                        Message = "Invalid role",
                        Errors = { "Specified role does not exist" }
                    };
                }

                // Check if role is changing
                bool roleChanged = user.Role.RoleId != request.RoleId;


                // Update user basic information
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

                //// Update address details
                //user.HometownProvince = request.HometownProvince?.Trim();
                //user.HometownDistrict = request.HometownDistrict?.Trim();
                //user.HometownWard = request.HometownWard?.Trim();
                //user.BirthProvince = request.BirthProvince?.Trim();
                //user.BirthDistrict = request.BirthDistrict?.Trim();
                //user.BirthWard = request.BirthWard?.Trim();
                //user.PermanentProvince = request.PermanentProvince?.Trim();
                //user.PermanentDistrict = request.PermanentDistrict?.Trim();
                //user.PermanentWard = request.PermanentWard?.Trim();

                // Update additional info
                user.Object = request.Object?.Trim();
                user.PolicyArea = request.PolicyArea?.Trim();
                user.DateOfJoinUnion = request.DateOfJoinUnion;
                user.DateOfJoinParty = request.DateOfJoinParty;

                // Update role if changed
                if (roleChanged)
                {
                    user.Role = newRole;
                }

                context.Users.Update(user);
                await context.SaveChangesAsync();

                // Handle role-specific entity updates
                object? roleSpecificEntity = null;
                string roleSpecificMessage = "";

                if (roleChanged)
                {
                    // If role changed, handle old and new role entities
                    await HandleRoleChangeAsync(user, user.Role.RoleId, request.RoleId, request);
                    roleSpecificMessage = $" Role changed from {user.Role.RoleName} to {newRole.RoleName}.";
                }
                else
                {
                    // If role didn't change, just update the existing role-specific entity
                    roleSpecificEntity = await UpdateRoleSpecificEntityAsync(user, request);
                    roleSpecificMessage = " Role-specific information updated.";
                }

                await transaction.CommitAsync();

                return new UserUpdateResult
                {
                    IsSuccess = true,
                    Message = $"User updated successfully.{roleSpecificMessage}",
                    User = user,
                    RoleSpecificEntity = roleSpecificEntity
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new UserUpdateResult
                {
                    IsSuccess = false,
                    Message = "Update failed due to system error",
                    Errors = { ex.Message }
                };
            }
        }

        private async Task<object?> UpdateRoleSpecificEntityAsync(User user, UpdateUserWithRoleRequest request)
        {
            switch (request.RoleId)
            {
                case 2: // Student
                    if (request.StudentSpecificData != null)
                    {
                        var student = await context.Students
                            .FirstOrDefaultAsync(s => s.User.UserId == user.UserId);

                        if (student != null)
                        {
                            if (request.StudentSpecificData.ClassId.HasValue)
                            {
                                var newClass = await context.Classes.FindAsync(request.StudentSpecificData.ClassId.Value);
                                if (newClass != null)
                                {
                                    student.Class = newClass;
                                }
                            }

                            if (request.StudentSpecificData.StudentStatus.HasValue)
                            {
                                student.StudentStatus = request.StudentSpecificData.StudentStatus.Value;
                            }

                            if (request.StudentSpecificData.AdmissionDate.HasValue)
                            {
                                student.DateOfAdmission = request.StudentSpecificData.AdmissionDate.Value;
                            }

                            if (request.StudentSpecificData.Year.HasValue)
                            {
                                student.YearOfAdmission = request.StudentSpecificData.Year.Value;
                            }

                            context.Students.Update(student);
                            await context.SaveChangesAsync();
                            return student;
                        }
                    }
                    break;

                case 3: // Lecturer
                    if (request.LecturerSpecificData != null)
                    {
                        var lecturer = await context.Lecturers
                            .FirstOrDefaultAsync(l => l.User.UserId == user.UserId);

                        if (lecturer != null)
                        {
                            if (request.LecturerSpecificData.DepartmentId.HasValue)
                            {
                                var newDepartment = await context.Departments.FindAsync(request.LecturerSpecificData.DepartmentId.Value);
                                if (newDepartment != null)
                                {
                                    lecturer.Department = newDepartment;
                                }
                            }

                            if (!string.IsNullOrWhiteSpace(request.LecturerSpecificData.Position))
                            {
                                lecturer.Position = request.LecturerSpecificData.Position.Trim();
                            }

                            if (!string.IsNullOrWhiteSpace(request.LecturerSpecificData.AcademicTitle))
                            {
                                lecturer.AcademicTitle = request.LecturerSpecificData.AcademicTitle.Trim();
                            }

                            context.Lecturers.Update(lecturer);
                            await context.SaveChangesAsync();
                            return lecturer;
                        }
                    }
                    break;

                case 1: // Admin
                        // No specific entity for admin
                    break;
            }

            return null;
        }

        private async Task HandleRoleChangeAsync(User user, int oldRoleId, int newRoleId, UpdateUserWithRoleRequest request)
        {
            // Remove old role-specific entity
            switch (oldRoleId)
            {
                case 2: // Remove Student
                    var oldStudent = await context.Students
                        .FirstOrDefaultAsync(s => s.User.UserId == user.UserId);
                    if (oldStudent != null)
                    {
                        context.Students.Remove(oldStudent);
                    }
                    break;

                case 3: // Remove Lecturer
                    var oldLecturer = await context.Lecturers
                        .FirstOrDefaultAsync(l => l.User.UserId == user.UserId);
                    if (oldLecturer != null)
                    {
                        context.Lecturers.Remove(oldLecturer);
                    }
                    break;
            }

            // Create new role-specific entity
            switch (newRoleId)
            {
                case 2: // Create Student
                    if (request.StudentSpecificData != null && request.StudentSpecificData.ClassId.HasValue)
                    {
                        var studentClass = await context.Classes.FindAsync(request.StudentSpecificData.ClassId.Value);
                        if (studentClass != null)
                        {
                            var newStudent = new Student
                            {
                                User = user,
                                MSSV = user.Username,
                                Class = studentClass,
                                StudentStatus = request.StudentSpecificData.StudentStatus ?? StudentStatus.Active,
                                DateOfAdmission = request.StudentSpecificData.AdmissionDate ?? DateOnly.FromDateTime(DateTime.Now),
                                YearOfAdmission = request.StudentSpecificData.Year ?? DateTime.Now.Year
                            };

                            context.Students.Add(newStudent);
                        }
                    }
                    break;

                case 3: // Create Lecturer
                    if (request.LecturerSpecificData != null && request.LecturerSpecificData.DepartmentId.HasValue)
                    {
                        var department = await context.Departments.FindAsync(request.LecturerSpecificData.DepartmentId.Value);
                        if (department != null)
                        {
                            var newLecturer = new Lecturer
                            {
                                User = user,
                                LecturerCode = user.Username,
                                Department = department,
                                Position = request.LecturerSpecificData.Position?.Trim(),
                                AcademicTitle = request.LecturerSpecificData.AcademicTitle?.Trim()
                            };

                            context.Lecturers.Add(newLecturer);
                        }
                    }
                    break;
            }

            await context.SaveChangesAsync();
        }

        private async Task<(bool IsValid, List<string> Errors)> ValidateUserUpdateRequestAsync(int userId, UpdateUserWithRoleRequest request)
        {
            var errors = new List<string>();

            // Check email uniqueness (if changed)
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailExists = await context.Users
                    .AnyAsync(u => u.Email == request.Email && u.UserId != userId);
                if (emailExists)
                {
                    errors.Add("Email address is already in use by another user");
                }
            }

            // Check citizen ID uniqueness (if changed)
            if (!string.IsNullOrWhiteSpace(request.CitizenIdCard))
            {
                var citizenIdExists = await context.Users
                    .AnyAsync(u => u.CitizenIdCard == request.CitizenIdCard && u.UserId != userId);
                if (citizenIdExists)
                {
                    errors.Add("Citizen ID card is already in use by another user");
                }
            }

            // Role-specific validation
            switch (request.RoleId)
            {
                case 2: // Student
                    if (request.StudentSpecificData?.ClassId.HasValue == true)
                    {
                        var classExists = await context.Classes.AnyAsync(c => c.ClassId == request.StudentSpecificData.ClassId.Value);
                        if (!classExists)
                        {
                            errors.Add("Specified class does not exist");
                        }
                    }
                    break;

                case 3: // Lecturer
                    if (request.LecturerSpecificData?.DepartmentId.HasValue == true)
                    {
                        var departmentExists = await context.Departments.AnyAsync(d => d.DepartmentId == request.LecturerSpecificData.DepartmentId.Value);
                        if (!departmentExists)
                        {
                            errors.Add("Specified department does not exist");
                        }
                    }
                    break;
            }

            return (errors.Count == 0, errors);
        }

        public async Task<bool> DeactivateUserAsync(int userId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var user = await context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                // Set user account status to inactive
                user.AccountStatus = AccountStatus.InActive;

                // Optionally clear refresh token to force logout
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(-1); // Set to past date

                context.Users.Update(user);

                // Deactivate all bank accounts of this user
                var userBankAccounts = await context.BankAccounts
                    .Where(ba => ba.User.UserId == userId && ba.AccountStatus == Enum.AccountStatus.Active)
                    .ToListAsync();

                foreach (var account in userBankAccounts)
                {
                    account.AccountStatus = Enum.AccountStatus.InActive;
                    account.IsDefault = false;
                }

                if (userBankAccounts.Any())
                {
                    context.BankAccounts.UpdateRange(userBankAccounts);
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ReactivateUserAsync(int userId)
        {
            var user = await context.Users.FindAsync(userId);
            if (user == null)
                return false;

            // Reactivate the user account
            user.AccountStatus = AccountStatus.Active;

            context.Users.Update(user);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<User?> UpdateUserAvatarAsync(int userId, string avatarUrl)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var user = await context.Users.FindAsync(userId);
                if (user == null)
                {
                    return null;
                }
                user.AvatarUrl = avatarUrl;
                context.Users.Update(user);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ForgotPasswordByMSSVResponse> ForgotPasswordByMSSVAsync(ForgotPasswordByMSSVRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Tìm sinh viên theo MSSV
                var student = await context.Students
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.MSSV == request.MSSV.Trim());

                if (student == null)
                {
                    return new ForgotPasswordByMSSVResponse
                    {
                        IsSuccess = false,
                        Message = "Không tìm thấy sinh viên với MSSV này",
                        Errors = { "MSSV không tồn tại trong hệ thống" }
                    };
                }

                // Kiểm tra tài khoản có hoạt động không
                if (student.User.AccountStatus != AccountStatus.Active)
                {
                    return new ForgotPasswordByMSSVResponse
                    {
                        IsSuccess = false,
                        Message = "Tài khoản không hoạt động",
                        Errors = { "Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ quản trị viên." }
                    };
                }

                // Kiểm tra email có tồn tại không
                if (string.IsNullOrWhiteSpace(student.User.Email))
                {
                    return new ForgotPasswordByMSSVResponse
                    {
                        IsSuccess = false,
                        Message = "Không có thông tin email",
                        Errors = { "Tài khoản của bạn chưa có email. Vui lòng liên hệ quản trị viên để cập nhật email." }
                    };
                }

                // Tạo mật khẩu mặc định (có thể là MSSV + năm sinh hoặc format khác)
                var defaultPassword = "123456";

                //// Hash mật khẩu mặc định
                //var hashedPassword = new PasswordHasher<User>().HashPassword(student.User, defaultPassword);

                // Cập nhật mật khẩu
                student.User.PasswordHash = defaultPassword;
                
                // Xóa refresh token để buộc đăng nhập lại
                student.User.RefreshToken = null;
                student.User.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(-1);

                context.Users.Update(student.User);
                await context.SaveChangesAsync();

                // Gửi email với mật khẩu mặc định
                var emailSent = await emailService.SendDefaultPasswordEmailAsync(
                    student.User.Email,
                    defaultPassword,
                    student.User.FullName,
                    student.MSSV);

                if (!emailSent)
                {
                    await transaction.RollbackAsync();
                    return new ForgotPasswordByMSSVResponse
                    {
                        IsSuccess = false,
                        Message = "Không thể gửi email",
                        Errors = { "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau." }
                    };
                }

                await transaction.CommitAsync();

                return new ForgotPasswordByMSSVResponse
                {
                    IsSuccess = true,
                    Message = "Mật khẩu mặc định đã được gửi đến email của bạn",
                    StudentName = student.User.FullName,
                    Email = MaskEmail(student.User.Email)
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ForgotPasswordByMSSVResponse
                {
                    IsSuccess = false,
                    Message = "Có lỗi xảy ra khi xử lý yêu cầu",
                    Errors = { ex.Message }
                };
            }
        }

        private static string GenerateDefaultPassword(string mssv, DateOnly? dateOfBirth)
        {
            // Tạo mật khẩu mặc định theo format: MSSV + 4 số cuối năm sinh
            // Ví dụ: 20210001 + 2003 = 202100012003
            if (dateOfBirth.HasValue)
            {
                var birthYear = dateOfBirth.Value.Year.ToString();
                return mssv + birthYear;
            }
            
            // Nếu không có ngày sinh, dùng MSSV + "2024"
            return mssv + "2024";
        }

        private static string MaskEmail(string email)
        {
            // Ẩn một phần email để bảo mật
            // Ví dụ: john.doe@example.com -> j***@example.com
            if (string.IsNullOrEmpty(email)) return "";
            
            var atIndex = email.IndexOf('@');
            if (atIndex <= 1) return email;
            
            var localPart = email.Substring(0, atIndex);
            var domainPart = email.Substring(atIndex);
            
            if (localPart.Length <= 3)
            {
                return localPart[0] + "***" + domainPart;
            }
            
            return localPart[0] + "***" + localPart[^1] + domainPart;
        }
    }
}
