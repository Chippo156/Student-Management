using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
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

        private async Task<Semester?> GetCurrentSemesterAsync()
        {
            var currentDate = DateTime.Now;
            return await context.Semesters
                .Where(s => s.StartDate <= DateOnly.FromDateTime(currentDate) &&
                           s.EndDate >= DateOnly.FromDateTime(currentDate))
                .FirstOrDefaultAsync();
        }

        private async Task<List<CurrentSectionInfo>> GetCurrentSectionsAsync(int lecturerId, int? currentSemesterId)
        {
            if (currentSemesterId == null)
                return new List<CurrentSectionInfo>();

            var sections = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Semester)
                .Include(s => s.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .Where(s => s.Lecturer.Id == lecturerId && s.Semester.SemesterId == currentSemesterId)
                .ToListAsync();

            var result = new List<CurrentSectionInfo>();

            foreach (var section in sections)
            {
                var schedules = section.Schedules.Select(sch => new ScheduleInfo
                {
                    DayOfWeek = GetDayOfWeekInVietnamese(sch.DayOfWeek),
                    TimeSlot = $"{sch.StartTime:HH:mm} - {sch.EndTime:HH:mm}",
                    Room = sch.Room,
                    ScheduleType = sch.ScheduleType?.Name ?? "Unknown"
                }).ToList();

                result.Add(new CurrentSectionInfo
                {
                    SectionId = section.SectionId,
                    SectionCode = section.SectionCode ?? $"SEC{section.SectionId}",
                    CourseCode = section.CurriculumCourse.Course.CourseCode,
                    CourseName = section.CurriculumCourse.Course.CourseName,
                    Credits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,
                    EnrolledCount = section.EnrolledCount,
                    Capacity = section.Capacity,
                    SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
                    Schedules = schedules
                });
            }

            return result;
        }

        private async Task<TeachingStatistics> GetTeachingStatisticsAsync(int lecturerId)
        {
            // Get current semester
            var currentSemester = await GetCurrentSemesterAsync();

            // Get all sections taught by this lecturer
            var allSections = await context.Sections
                .Include(s => s.Semester)
                .Where(s => s.Lecturer.Id == lecturerId)
                .ToListAsync();

            // Current semester statistics
            var currentSemesterSections = currentSemester != null
                ? allSections.Where(s => s.Semester.SemesterId == currentSemester.SemesterId).ToList()
                : new List<Section>();

            var totalStudentsCurrentSemester = currentSemesterSections.Sum(s => s.EnrolledCount);
            var totalSectionsCurrentSemester = currentSemesterSections.Count;

            // All time statistics
            var totalSectionsAllTime = allSections.Count;
            var averageClassSize = totalSectionsAllTime > 0
                ? Math.Round((double)allSections.Sum(s => s.EnrolledCount) / totalSectionsAllTime, 2)
                : 0;

            // Semester history
            var semesterHistory = allSections
                .GroupBy(s => s.Semester)
                .Select(g => new SemesterTeachingInfo
                {
                    SemesterId = g.Key.SemesterId,
                    SemesterName = $"{g.Key.Year} - {g.Key.Term}",
                    SectionsCount = g.Count(),
                    StudentsCount = g.Sum(s => s.EnrolledCount),
                    AverageClassSize = g.Count() > 0 ? Math.Round((double)g.Sum(s => s.EnrolledCount) / g.Count(), 2) : 0
                })
                .OrderByDescending(s => s.SemesterId)
                .ToList();

            return new TeachingStatistics
            {
                TotalSectionsCurrentSemester = totalSectionsCurrentSemester,
                TotalStudentsCurrentSemester = totalStudentsCurrentSemester,
                TotalSectionsAllTime = totalSectionsAllTime,
                AverageClassSize = averageClassSize,
                SemesterHistory = semesterHistory
            };
        }

        private string GetDayOfWeekInVietnamese(DayOfWeek? dayOfWeek)
        {
            if (!dayOfWeek.HasValue) return "";

            return dayOfWeek.Value switch
            {
                DayOfWeek.Monday => "Thứ 2",
                DayOfWeek.Tuesday => "Thứ 3",
                DayOfWeek.Wednesday => "Thứ 4",
                DayOfWeek.Thursday => "Thứ 5",
                DayOfWeek.Friday => "Thứ 6",
                DayOfWeek.Saturday => "Thứ 7",
                DayOfWeek.Sunday => "Chủ nhật",
                _ => ""
            };
        }

        public Task<Lecturer?> GetLecturerByIdAsync(int lecturerId)
        {
            throw new NotImplementedException();
        }
    }
}
