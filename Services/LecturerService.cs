using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class LecturerService(AppDbContext context) : ILecturerService
    {
        public Task<Lecturer> CreateLecturerAsync(LecturerRequest lecturer)
        {
            User? user = context.Users.FirstOrDefault(u => u.UserId == lecturer.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            Department? department = context.Departments.FirstOrDefault(d => d.DepartmentId == lecturer.DepartmentId);
            if (department == null)
            {
                throw new Exception("Department not found");
            }
            var newLecturer = new Lecturer
            {
                User = user,
                Department = department,
                Position = lecturer.Position,
                AcademicTitle = lecturer.AcademicTitle,
            };
            context.Lecturers.Add(newLecturer);
            context.SaveChanges();
            return Task.FromResult(newLecturer);
        }

        public Task<bool> DeleteLecturerAsync(int lecturerId)
        {
            Lecturer lecturer = context.Lecturers.Find(lecturerId) ?? throw new Exception("Lecturer not found");
            context.Lecturers.Remove(lecturer);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public async Task<IEnumerable<Lecturer>> GetAllLecturersAsync()
        {
            return await context.Lecturers.Include(l => l.User).
                ToListAsync();
        }

        public async Task<PagedResult<Lecturer>> GetAllLecturersAsync(PaginationParams pagination, string? search)
        {
            var query = context.Lecturers
               .Include(s => s.User)
               .Include(s => s.Department)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(u =>
                    u.User.FullName.ToLower().Contains(searchTerm) ||
                    (u.User.Email != null && u.User.Email.ToLower().Contains(searchTerm)) ||
                    u.LecturerCode.ToLower().Contains(searchTerm) || u.User.Phone.ToLower().Contains(searchTerm)
                    || u.Department.DepartmentName.ToLower().Contains(searchTerm));
            }

            // Tổng số bản ghi
            var totalCount = await query.CountAsync();

            // Lấy trang hiện tại
            var students = await query
                .OrderByDescending(s => s.User.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();


            // Gói kết quả vào PagedResult
            return new PagedResult<Lecturer>
            {
                Items = students,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<PagedResult<Lecturer>> GetAllLecturersAsync(
            PaginationParams pagination, 
            string? search = null,
            int? departmentId = null,
            string? position = null,
            string? academicTitle = null,
            LecturerStatus? lecturerStatus = null)
        {
            var query = context.Lecturers
                .Include(l => l.User)
                .Include(l => l.Department)
                    .ThenInclude(d => d.Faculty)
                .AsQueryable();

            // Apply search filter - tìm kiếm theo tên, email, mã giảng viên, số điện thoại
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(l =>
                    l.User.FullName.ToLower().Contains(searchTerm) ||
                    (l.User.Email != null && l.User.Email.ToLower().Contains(searchTerm)) ||
                    l.LecturerCode.ToLower().Contains(searchTerm) ||
                    (l.User.Phone != null && l.User.Phone.ToLower().Contains(searchTerm)) ||
                    l.Department.DepartmentName.ToLower().Contains(searchTerm));
            }

            // Filter by department (khoa)
            if (departmentId.HasValue)
            {
                query = query.Where(l => l.Department.DepartmentId == departmentId.Value);
            }

            // Filter by position (chức vụ)
            if (!string.IsNullOrWhiteSpace(position))
            {
                var positionTerm = position.Trim().ToLower();
                query = query.Where(l => l.Position.ToLower().Contains(positionTerm));
            }

            // Filter by academic title (học hàm)
            if (!string.IsNullOrWhiteSpace(academicTitle))
            {
                var titleTerm = academicTitle.Trim().ToLower();
                query = query.Where(l => l.AcademicTitle.ToLower().Contains(titleTerm));
            }

            // Filter by account status (trạng thái tài khoản)
            if (lecturerStatus.HasValue)
            {
                query = query.Where(l => l.LecturerStatus == lecturerStatus.Value);
            }

            // Tổng số bản ghi sau khi apply filter
            var totalCount = await query.CountAsync();

            // Apply pagination và sắp xếp
            var lecturers = await query
                .OrderByDescending(l => l.User.CreatedAt)
                .ThenBy(l => l.Position)
                .ThenBy(l => l.User.FullName)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Gói kết quả vào PagedResult
            return new PagedResult<Lecturer>
            {
                Items = lecturers,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<LecturerDetailResponse?> GetLecturerDetailByCodeAsync(string lecturerCode)
        {
            try
            {
                // Get lecturer with all related information
                var lecturer = await context.Lecturers
                    .Include(l => l.User)
                        .ThenInclude(u => u.Role)
                    .Include(l => l.Department)
                        .ThenInclude(d => d.Faculty)
                    .FirstOrDefaultAsync(l => l.LecturerCode == lecturerCode);

                if (lecturer == null)
                {
                    return null;
                }

                // Create base user response
                var userResponse = new UserResponse
                {
                    UserId = lecturer.User.UserId,
                    Username = lecturer.User.Username,
                    FullName = lecturer.User.FullName,
                    Email = lecturer.User.Email ?? string.Empty,
                    Phone = lecturer.User.Phone ?? string.Empty,
                    Address = lecturer.User.Address,
                    TemporaryAddress = lecturer.User.TemporaryAddress,
                    AvatarUrl = lecturer.User.AvatarUrl,
                    Gender = lecturer.User.Gender,
                    PlaceOfBirth = lecturer.User.PlaceOfBirth,
                    Religion = lecturer.User.Religion,
                    DateOfBirth = lecturer.User.DateOfBirth,
                    CitizenIdCard = lecturer.User.CitizenIdCard,
                    IssuedDate = lecturer.User.IssuedDate,
                    IssuedPlace = lecturer.User.IssuedPlace,
                    Object = lecturer.User.Object,
                    PolicyArea = lecturer.User.PolicyArea,
                    DateOfJoinUnion = lecturer.User.DateOfJoinUnion,
                    DateOfJoinParty = lecturer.User.DateOfJoinParty,
                    Ethnicity = lecturer.User.Ethnicity,
                    Nationality = lecturer.User.Nationality,
                    HometownProvince = lecturer.User.HometownProvince,
                    HometownDistrict = lecturer.User.HometownDistrict,
                    HometownWard = lecturer.User.HometownWard,
                    BirthProvince = lecturer.User.BirthProvince,
                    BirthDistrict = lecturer.User.BirthDistrict,
                    BirthWard = lecturer.User.BirthWard,
                    BirthCertProvince = lecturer.User.BirthCertProvince,
                    BirthCertDistrict = lecturer.User.BirthCertDistrict,
                    BirthCertWard = lecturer.User.BirthCertWard,
                    PermanentProvince = lecturer.User.PermanentProvince,
                    PermanentDistrict = lecturer.User.PermanentDistrict,
                    PermanentWard = lecturer.User.PermanentWard,
                    HealthInsuranceNumber = lecturer.User.HealthInsuranceNumber,
                    HealthInsuranceRegistrationPlace = lecturer.User.HealthInsuranceRegistrationPlace,
                    AccountStatus = lecturer.User.AccountStatus,
                    Role = lecturer.User.Role
                };

                // Get current semester
                //var currentSemester = await GetCurrentSemesterAsync();

                //// Get current sections teaching
                //var currentSections = await GetCurrentSectionsAsync(lecturer.Id, currentSemester?.SemesterId);

                //// Get teaching statistics
                //var statistics = await GetTeachingStatisticsAsync(lecturer.Id);

                // Get advisor classes

                var response = new LecturerDetailResponse
                {
                    LecturerId = lecturer.Id,
                    LecturerCode = lecturer.LecturerCode,
                    Position = lecturer.Position,
                    AcademicTitle = lecturer.AcademicTitle,
                    DepartmentName = lecturer.Department?.DepartmentName ?? "Not Assigned",
                    FacultyName = lecturer.Department?.Faculty?.FacultyName ?? "Not Assigned",
                    User = userResponse,
                    //Statistics = statistics,
                    //CurrentSections = currentSections,
                };

                return response;
            }
            catch (Exception)
            {
                return null;
            }
        }

        
        public async Task<Lecturer?> UpdateLecturerProfileAsync(string lecturerCode, LecturerUpdateRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                // Lấy thông tin giảng viên hiện tại
                var lecturer = await context.Lecturers
                    .Include(l => l.User)
                    .FirstOrDefaultAsync(l => l.User.Username == lecturerCode);

                if (lecturer == null)
                {
                    throw new Exception("Không tìm thấy thông tin giảng viên");
                }

                // Kiểm tra trạng thái tài khoản
                if (lecturer.User.AccountStatus != AccountStatus.Active)
                {
                    throw new Exception("Tài khoản không hoạt động, không thể cập nhật thông tin");
                }

                // Cập nhật thông tin User
                var user = lecturer.User;
                //user.FullName = request.FullName;
                //user.Gender = request.Gender;
                //user.DateOfBirth = request.DateOfBirth;
                //user.Ethnicity = request.Ethnicity;
                //user.Nationality = request.Nationality;
                //user.CitizenIdCard = request.CitizenIdCard;
                //user.IssuedDate = request.IssuedDate;
                //user.IssuedPlace = request.IssuedPlace;
                //user.HealthInsuranceNumber = request.HealthInsuranceNumber;
                //user.HealthInsuranceRegistrationPlace = request.HealthInsuranceRegistrationPlace;
                //user.Email = request.Email;
                //user.Phone = request.Phone;
                //user.Address = request.Address;
                //user.TemporaryAddress = request.TemporaryAddress;
                //user.PlaceOfBirth = request.PlaceOfBirth;
                //user.Religion = request.Religion;
                //user.Object = request.Object;
                //user.PolicyArea = request.PolicyArea;
                //user.DateOfJoinUnion = request.DateOfJoinUnion;
                //user.DateOfJoinParty = request.DateOfJoinParty;

                user.FullName = request.FullName;
                user.Email = request.Email;
                user.Phone = request.Phone;
                user.Gender = request.Gender;
                    user.Address = request.Address;

                user.BirthProvince = request.BirthProvince;
                user.BirthWard = request.BirthWard;
                user.BirthDistrict = request.BirthDistrict;

                user.BirthCertProvince = request.BirthCertProvince;
                user.BirthCertDistrict = request.BirthCertDistrict;
                user.BirthCertWard = request.BirthCertWard;

                user.HometownProvince = request.HometownProvince;
                user.HometownDistrict = request.HometownDistrict;
                user.HometownWard = request.HometownWard;

                user.PermanentProvince = request.PermanentProvince;
                user.PermanentDistrict = request.PermanentDistrict;
                user.PermanentWard = request.PermanentWard;

                user.TemporaryAddress = request.TemporaryAddress;
                user.Ethnicity = request.Ethnicity;
                user.Nationality = request.Nationality;
                user.HealthInsuranceNumber = request.HealthInsuranceNumber;
                user.HealthInsuranceRegistrationPlace = request.RegisteredHospital;

                user.Religion = request.Religion;
                user.DateOfBirth = request.DateOfBirth;
                user.CitizenIdCard = request.CitizenIdCard;
                user.IssuedDate = request.IssuedDate;
                user.IssuedPlace = request.IssuedPlace;
                user.Object = request.Object;
                user.PolicyArea = request.PolicyArea;
                user.DateOfJoinUnion = request.DateOfJoinUnion;
                user.DateOfJoinParty = request.DateOfJoinParty;


                // Kiểm tra trùng lặp email và phone với người dùng khác
                if (!string.IsNullOrEmpty(request.Email))
                {
                    var existingUserWithEmail = await context.Users
                        .FirstOrDefaultAsync(u => u.Email == request.Email && u.UserId != user.UserId);

                    if (existingUserWithEmail != null)
                    {
                        throw new Exception("Email này đã được sử dụng bởi người dùng khác");
                    }
                }

                if (!string.IsNullOrEmpty(request.Phone))
                {
                    var existingUserWithPhone = await context.Users
                        .FirstOrDefaultAsync(u => u.Phone == request.Phone && u.UserId != user.UserId);

                    if (existingUserWithPhone != null)
                    {
                        throw new Exception("Số điện thoại này đã được sử dụng bởi người dùng khác");
                    }
                }

                if (!string.IsNullOrEmpty(request.CitizenIdCard))
                {
                    var existingUserWithCitizenId = await context.Users
                        .FirstOrDefaultAsync(u => u.CitizenIdCard == request.CitizenIdCard && u.UserId != user.UserId);

                    if (existingUserWithCitizenId != null)
                    {
                        throw new Exception("Số CMND/CCCD này đã được sử dụng bởi người dùng khác");
                    }
                }

                // Lưu thay đổi
                context.Users.Update(user);
                context.Lecturers.Update(lecturer);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return lecturer;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public Task<IEnumerable<LecturerDropdownResponse>> GetLecturerDropdownsByDepartmentIdAsync(int departmentId)
        {
            var lecturers = context.Lecturers
                .Include(l => l.User)
                .Where(l => l.Department.DepartmentId == departmentId)
                .Select(l => new LecturerDropdownResponse
                {
                    Id = l.Id,
                    LecturerCode = l.LecturerCode,
                    Name = l.User.FullName
                });
            return Task.FromResult(lecturers.AsEnumerable());
        }

        public Task<Lecturer?> GetLecturerByIdAsync(int lecturerId)
        {
            throw new NotImplementedException();
        }
    }
}
