using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class RegistrationPeriodService : IRegistrationPeriodService
    {
        private readonly AppDbContext _context;

        public RegistrationPeriodService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<RegistrationPeriodResponse>> GetAllRegistrationPeriodsAsync(
            PaginationParams pagination,
            int? semesterId = null,
            int? departmentId = null,
            bool? isActive = null)
        {
            var query = _context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                    .ThenInclude(d => d.Faculty)
                .AsQueryable();

            // Apply filters
            if (semesterId.HasValue)
            {
                query = query.Where(rp => rp.Semester.SemesterId == semesterId.Value);
            }

            if (departmentId.HasValue)
            {
                query = query.Where(rp => rp.Department.DepartmentId == departmentId.Value);
            }

            if (isActive.HasValue)
            {
                var now = DateTime.UtcNow;
                if (isActive.Value)
                {
                    query = query.Where(rp => rp.StartDate <= now && rp.EndDate >= now);
                }
                else
                {
                    query = query.Where(rp => rp.StartDate > now || rp.EndDate < now);
                }
            }

            var totalCount = await query.CountAsync();

            var registrationPeriods = await query
                .OrderByDescending(rp => rp.StartDate)
                .ThenBy(rp => rp.Department.DepartmentName)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var responses = registrationPeriods.Select(MapToRegistrationPeriodResponse).ToList();

            return new PagedResult<RegistrationPeriodResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<RegistrationPeriodDetailResponse?> GetRegistrationPeriodByIdAsync(int id)
        {
            var registrationPeriod = await _context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                    .ThenInclude(d => d.Faculty)
                .FirstOrDefaultAsync(rp => rp.RegistrationPeriodId == id);

            if (registrationPeriod == null)
                return null;

            // Get section statistics for this registration period
            var sections = await _context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Where(s => s.Semester.SemesterId == registrationPeriod.Semester.SemesterId &&
                           s.CurriculumCourse.Program.Department.DepartmentId == registrationPeriod.Department.DepartmentId)
                .ToListAsync();

            var sectionStats = sections.Select(s => new SectionRegistrationStats
            {
                SectionId = s.SectionId,
                SectionCode = s.SectionCode ?? $"LHP{s.SectionId}",
                CourseCode = s.CurriculumCourse.Course.CourseCode,
                CourseName = s.CurriculumCourse.Course.CourseName,
                EnrolledCount = s.EnrolledCount,
                Capacity = s.Capacity,
                FillRate = s.Capacity > 0 ? Math.Round((double)s.EnrolledCount / s.Capacity * 100, 2) : 0
            }).ToList();

            var totalEnrollments = await _context.Enrollments
                .CountAsync(e => e.Section.Semester.SemesterId == registrationPeriod.Semester.SemesterId &&
                                e.Section.CurriculumCourse.Program.Department.DepartmentId == registrationPeriod.Department.DepartmentId &&
                                e.enrollmentStatus == EnrollmentStatus.Enrolled);

            var baseResponse = MapToRegistrationPeriodResponse(registrationPeriod);

            return new RegistrationPeriodDetailResponse
            {
                RegistrationPeriodId = baseResponse.RegistrationPeriodId,
                SemesterId = baseResponse.SemesterId,
                SemesterName = baseResponse.SemesterName,
                SemesterYear = baseResponse.SemesterYear,
                SemesterTerm = baseResponse.SemesterTerm,
                DepartmentId = baseResponse.DepartmentId,
                DepartmentName = baseResponse.DepartmentName,
                FacultyName = baseResponse.FacultyName,
                StartDate = baseResponse.StartDate,
                EndDate = baseResponse.EndDate,
                IsActive = baseResponse.IsActive,
                Status = baseResponse.Status,
                DaysRemaining = baseResponse.DaysRemaining,
                HasStarted = baseResponse.HasStarted,
                HasEnded = baseResponse.HasEnded,
                Duration = baseResponse.Duration,
                
                // Additional detail info
                TotalSections = sections.Count,
                TotalEnrollments = totalEnrollments,
                CreatedAt = DateTime.UtcNow, // You might want to add this field to model
                SectionStats = sectionStats
            };
        }

        public async Task<RegistrationPeriod> CreateRegistrationPeriodAsync(RegistrationPeriodRequest request)
        {
            // Validate dates
            if (request.StartDate >= request.EndDate)
            {
                throw new ArgumentException("Start date must be before end date");
            }

            // Validate semester exists
            var semester = await _context.Semesters.FindAsync(request.SemesterId)
                ?? throw new ArgumentException($"Semester with ID {request.SemesterId} not found");

            // Validate department exists
            var department = await _context.Departments.FindAsync(request.DepartmentId)
                ?? throw new ArgumentException($"Department with ID {request.DepartmentId} not found");

            // Check for overlapping periods for the same semester and department
            var hasOverlap = await _context.RegistrationPeriods
                .AnyAsync(rp => rp.Semester.SemesterId == request.SemesterId &&
                               rp.Department.DepartmentId == request.DepartmentId &&
                               ((request.StartDate >= rp.StartDate && request.StartDate <= rp.EndDate) ||
                                (request.EndDate >= rp.StartDate && request.EndDate <= rp.EndDate) ||
                                (request.StartDate <= rp.StartDate && request.EndDate >= rp.EndDate)));

            if (hasOverlap)
            {
                throw new InvalidOperationException("Registration period overlaps with existing period for this semester and department");
            }

            var registrationPeriod = new RegistrationPeriod
            {
                Semester = semester,
                Department = department,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };

            _context.RegistrationPeriods.Add(registrationPeriod);
            await _context.SaveChangesAsync();

            return registrationPeriod;
        }

        public async Task<RegistrationPeriod?> UpdateRegistrationPeriodAsync(int id, UpdateRegistrationPeriodRequest request)
        {
            var registrationPeriod = await _context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                .FirstOrDefaultAsync(rp => rp.RegistrationPeriodId == id);

            if (registrationPeriod == null)
                return null;

            // Validate dates
            if (request.StartDate >= request.EndDate)
            {
                throw new ArgumentException("Start date must be before end date");
            }

            // Check if period has started (prevent modification if already started)
            if (DateTime.UtcNow > registrationPeriod.StartDate && DateTime.UtcNow < registrationPeriod.EndDate)
            {
                throw new InvalidOperationException("Cannot modify an active registration period");
            }

            // Check for overlapping periods (excluding current period)
            var hasOverlap = await _context.RegistrationPeriods
                .AnyAsync(rp => rp.RegistrationPeriodId != id &&
                               rp.Semester.SemesterId == registrationPeriod.Semester.SemesterId &&
                               rp.Department.DepartmentId == registrationPeriod.Department.DepartmentId &&
                               ((request.StartDate >= rp.StartDate && request.StartDate <= rp.EndDate) ||
                                (request.EndDate >= rp.StartDate && request.EndDate <= rp.EndDate) ||
                                (request.StartDate <= rp.StartDate && request.EndDate >= rp.EndDate)));

            if (hasOverlap)
            {
                throw new InvalidOperationException("Updated registration period would overlap with existing period");
            }

            registrationPeriod.StartDate = request.StartDate;
            registrationPeriod.EndDate = request.EndDate;

            _context.RegistrationPeriods.Update(registrationPeriod);
            await _context.SaveChangesAsync();

            return registrationPeriod;
        }

        public async Task<bool> DeleteRegistrationPeriodAsync(int id)
        {
            var registrationPeriod = await _context.RegistrationPeriods.FindAsync(id);
            
            if (registrationPeriod == null)
                return false;

            // Check if period is currently active
            var now = DateTime.UtcNow;
            if (now >= registrationPeriod.StartDate && now <= registrationPeriod.EndDate)
            {
                throw new InvalidOperationException("Cannot delete an active registration period");
            }

            // Check if there are enrollments during this period (optional check)
            var hasEnrollments = await _context.Enrollments
                .AnyAsync(e => e.RegisteredAt >= registrationPeriod.StartDate &&
                              e.RegisteredAt <= registrationPeriod.EndDate);

            if (hasEnrollments)
            {
                throw new InvalidOperationException("Cannot delete registration period with existing enrollments");
            }

            _context.RegistrationPeriods.Remove(registrationPeriod);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ToggleRegistrationPeriodStatusAsync(int id)
        {
            // Note: RegistrationPeriod doesn't have an explicit status field in the model
            // The IsActive is calculated based on current time vs StartDate/EndDate
            // This method would need to be implemented if you add an explicit status field
            
            throw new NotImplementedException("Toggle status not applicable for time-based registration periods");
        }

        public async Task<List<RegistrationPeriodResponse>> GetActiveRegistrationPeriodsAsync()
        {
            var now = DateTime.UtcNow;
            
            var activeRegistrationPeriods = await _context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                    .ThenInclude(d => d.Faculty)
                .Where(rp => rp.StartDate <= now && rp.EndDate >= now)
                .OrderBy(rp => rp.EndDate)
                .ToListAsync();

            return activeRegistrationPeriods.Select(MapToRegistrationPeriodResponse).ToList();
        }

        public async Task<RegistrationPeriodResponse?> GetActiveRegistrationPeriodByDepartmentAsync(int departmentId)
        {
            var now = DateTime.UtcNow;
            
            var activeRegistrationPeriod = await _context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                    .ThenInclude(d => d.Faculty)
                .FirstOrDefaultAsync(rp => rp.Department.DepartmentId == departmentId &&
                                          rp.StartDate <= now && rp.EndDate >= now);

            return activeRegistrationPeriod != null ? MapToRegistrationPeriodResponse(activeRegistrationPeriod) : null;
        }

        public async Task<List<RegistrationPeriodResponse>> GetRegistrationPeriodsBySemesterAsync(int semesterId)
        {
            var registrationPeriods = await _context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                    .ThenInclude(d => d.Faculty)
                .Where(rp => rp.Semester.SemesterId == semesterId)
                .OrderBy(rp => rp.Department.DepartmentName)
                .ToListAsync();

            return registrationPeriods.Select(MapToRegistrationPeriodResponse).ToList();
        }

        private static RegistrationPeriodResponse MapToRegistrationPeriodResponse(RegistrationPeriod rp)
        {
            var now = DateTime.UtcNow;
            var isActive = now >= rp.StartDate && now <= rp.EndDate;
            var hasStarted = now >= rp.StartDate;
            var hasEnded = now > rp.EndDate;

            var status = hasEnded ? "Ended" : isActive ? "Active" : "Not Started";
            var daysRemaining = isActive ? (int)(rp.EndDate - now).TotalDays : 0;
            var duration = $"{(rp.EndDate - rp.StartDate).TotalDays:F0} days";

            return new RegistrationPeriodResponse
            {
                RegistrationPeriodId = rp.RegistrationPeriodId,
                SemesterId = rp.Semester.SemesterId,
                SemesterName = $"{rp.Semester.Year} - {rp.Semester.Term}",
                SemesterYear = rp.Semester.Year,
                SemesterTerm = rp.Semester.Term,
                DepartmentId = rp.Department.DepartmentId,
                DepartmentName = rp.Department.DepartmentName,
                FacultyName = rp.Department.Faculty.FacultyName,
                StartDate = rp.StartDate,
                EndDate = rp.EndDate,
                IsActive = isActive,
                Status = status,
                DaysRemaining = daysRemaining,
                HasStarted = hasStarted,
                HasEnded = hasEnded,
                Duration = duration
            };
        }
    }
}