using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class ScheduleService(AppDbContext context) : IScheduleService
    {
        public async Task<bool> CheckScheduleConflictsAsync(int sectionId, DateOnly? dateEvent, DayOfWeek? dayOfWeek, TimeOnly startTime, TimeOnly endTime, string room)
        {
            // Check for room conflicts at the same time with main schedules (theory schedules)
            var mainScheduleConflicts = await context.Schedules
                .Where(s => s.DayOfWeek == dayOfWeek &&
                            s.Date == dateEvent &&
                           s.Room == room &&
                           s.Section.SectionId != sectionId &&
                           !s.PracticeGroupId.HasValue && // Only main/theory schedules
                           ((s.StartTime <= startTime && s.EndTime > startTime) ||
                            (s.StartTime < endTime && s.EndTime >= endTime) ||
                            (s.StartTime >= startTime && s.EndTime <= endTime)))
                .AnyAsync();

            if (mainScheduleConflicts)
            {
                return true;
            }

            // Check for room conflicts with practice group schedules
            var practiceScheduleConflicts = await context.Schedules
                .Where(s => s.DayOfWeek == dayOfWeek &&
                            s.Date == dateEvent &&
                           s.Room == room &&
                           s.PracticeGroupId.HasValue && // Only practice group schedules
                           ((s.StartTime <= startTime && s.EndTime > startTime) ||
                            (s.StartTime < endTime && s.EndTime >= endTime) ||
                            (s.StartTime >= startTime && s.EndTime <= endTime)))
                .AnyAsync();

            return practiceScheduleConflicts;
        }

        public async Task<CountSchedule> countSchedule(string mssv)
        {
            // Get the current date
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);

            // Determine the start and end date of the current week
            int dayOfWeek = (int)today.DayOfWeek;
            int daysToSubtract = dayOfWeek == 0 ? 6 : dayOfWeek - 1;

            DateOnly weekStart = today.AddDays(-daysToSubtract); // Monday of current week
            DateOnly weekEnd = weekStart.AddDays(6);             // Sunday of current week

            // Lấy thông tin sinh viên
            var student = await context.Students
                .FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (student == null)
            {
                return new CountSchedule { CountScheduleOfWeek = 0, CountTestOfWeek = 0 };
            }

            // Get all sections that the student is enrolled in and are active in the current week
            var studentSections = await context.Enrollments
                .Where(e => e.Student.MSSV == mssv)
                .Include(e => e.Section)
                .Where(e => e.Section.StartDate <= weekEnd && e.Section.EndDate >= weekStart)
                .Select(e => e.Section.SectionId)
                .Distinct()
                .ToListAsync();

            if (studentSections.Count == 0)
            {
                return new CountSchedule { CountScheduleOfWeek = 0, CountTestOfWeek = 0 };
            }

            // Lấy các nhóm thực hành mà sinh viên đã đăng ký
            var studentPracticeGroups = await context.PracticeGroupEnrollments
                .Include(pge => pge.PracticeGroup)
                .Where(pge => pge.StudentId == student.Id && 
                             pge.IsActive &&
                             studentSections.Contains(pge.PracticeGroup.SectionId))
                .Select(pge => pge.PracticeGroupId)
                .ToListAsync();

            // Count regular class schedules (recurring schedules with DayOfWeek) - không bao gồm lịch thực hành
            int regularScheduleCount = await context.Schedules
                .Include(s => s.ScheduleType)
                .Where(s => studentSections.Contains(s.Section.SectionId) &&
                           s.ScheduleType.ScheduleTypeId != 3 && // Not exam schedules
                           s.DayOfWeek.HasValue && // Regular recurring schedules
                           !s.PracticeGroupId.HasValue) // Không phải lịch thực hành
                .CountAsync();

            // Count practice schedules của sinh viên
            int practiceScheduleCount = await context.Schedules
                .Include(s => s.ScheduleType)
                .Where(s => s.PracticeGroupId.HasValue &&
                           studentPracticeGroups.Contains(s.PracticeGroupId.Value) &&
                           s.ScheduleType.ScheduleTypeId != 3 && // Not exam schedules
                           s.DayOfWeek.HasValue) // Regular recurring schedules
                .CountAsync();

            // Count test schedules (one-time events with specific dates in current week)
            int testScheduleCount = await context.Schedules
                .Include(s => s.ScheduleType)
                .Where(s => studentSections.Contains(s.Section.SectionId) &&
                           s.ScheduleType.ScheduleTypeId == 3 && // Exam schedules
                           s.Date.HasValue && // Has specific date
                           s.Date >= weekStart && s.Date <= weekEnd) // Within current week
                .CountAsync();

            return new CountSchedule
            {
                CountScheduleOfWeek = regularScheduleCount + practiceScheduleCount,
                CountTestOfWeek = testScheduleCount
            };
        }

        public async Task<Schedule> CreateScheduleAsync(ScheduleRequest request)
        {
            var section = await context.Sections.FindAsync(request.SectionId)
                ?? throw new Exception("Section not found");

            // Check for conflicts
            var hasConflicts = await CheckScheduleConflictsAsync(
                request.SectionId,
                request.Date, // Use request.Date for the dateEvent parameter
                request.DayOfWeek,
                request.StartTime,
                request.EndTime,
                request.Room);

            if (hasConflicts)
            {
                throw new Exception("Schedule conflicts with existing schedules");
            }
            var scheduleType = await context.ScheduleTypes.FindAsync(request.ScheduleTypeId)
                ?? throw new Exception("Schedule type not found");

            var schedule = new Schedule
            {
                Section = section,
                ScheduleType = scheduleType,
                DayOfWeek = request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Room = request.Room
            };
            if (request.Date.HasValue)
            {
                schedule.Date = request.Date.Value;
            }
            if (!string.IsNullOrEmpty(request.OnlineLink))
            {
                schedule.OnlineLink = request.OnlineLink;
            }

            context.Schedules.Add(schedule);
            await context.SaveChangesAsync();
            return schedule;
        }

        public async Task<bool> DeleteScheduleAsync(int scheduleId)
        {
            var schedule = await context.Schedules.FindAsync(scheduleId);
            if (schedule is null)
            {
                return false;
            }

            context.Schedules.Remove(schedule);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<PagedResult<ScheduleListResponse>> GetAllSchedulesWithFiltersAsync(ScheduleFilterRequest filterRequest)
        {
            var query = context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(s => s.Section)
                    .ThenInclude(s => s.Lecturer)
                        .ThenInclude(l => l.User)
                .Include(s => s.Section)
                    .ThenInclude(s => s.Semester)
                .Include(s => s.Section)
                    .ThenInclude(s => s.Class)
                .Include(s => s.ScheduleType)
                .Include(s => s.PracticeGroup)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filterRequest.CourseCode))
            {
                query = query.Where(s => s.Section.CurriculumCourse.Course.CourseCode.Contains(filterRequest.CourseCode.Trim()));
            }

            if (!string.IsNullOrWhiteSpace(filterRequest.CourseName))
            {
                query = query.Where(s => s.Section.CurriculumCourse.Course.CourseName.Contains(filterRequest.CourseName.Trim()));
            }

            if (!string.IsNullOrWhiteSpace(filterRequest.LecturerName))
            {
                query = query.Where(s => s.Section.Lecturer != null &&
                                       s.Section.Lecturer.User.FullName.Contains(filterRequest.LecturerName.Trim()));
            }

            if (!string.IsNullOrWhiteSpace(filterRequest.Room))
            {
                query = query.Where(s => !string.IsNullOrEmpty(s.Room) && s.Room.Contains(filterRequest.Room.Trim()));
            }

            if (filterRequest.SectionId.HasValue)
            {
                query = query.Where(s => s.Section.SectionId == filterRequest.SectionId.Value);
            }

            if (filterRequest.SemesterId.HasValue)
            {
                query = query.Where(s => s.Section.Semester.SemesterId == filterRequest.SemesterId.Value);
            }

            if (filterRequest.DepartmentId.HasValue)
            {
                query = query.Where(s => s.Section.CurriculumCourse.Program.Department.DepartmentId == filterRequest.DepartmentId.Value);
            }

            if (filterRequest.ScheduleTypeId.HasValue)
            {
                query = query.Where(s => s.ScheduleType.ScheduleTypeId == filterRequest.ScheduleTypeId.Value);
            }

            if (filterRequest.DayOfWeek.HasValue)
            {
                query = query.Where(s => s.DayOfWeek == filterRequest.DayOfWeek.Value);
            }

            if (filterRequest.Date.HasValue)
            {
                query = query.Where(s => s.Date == filterRequest.Date.Value);
            }

            if (filterRequest.StartDateFrom.HasValue)
            {
                query = query.Where(s => s.Date >= filterRequest.StartDateFrom.Value ||
                                       (s.Date == null && s.Section.StartDate >= filterRequest.StartDateFrom.Value));
            }

            if (filterRequest.StartDateTo.HasValue)
            {
                query = query.Where(s => s.Date <= filterRequest.StartDateTo.Value ||
                                       (s.Date == null && s.Section.StartDate <= filterRequest.StartDateTo.Value));
            }

            if (filterRequest.StartTimeFrom.HasValue)
            {
                query = query.Where(s => s.StartTime >= filterRequest.StartTimeFrom.Value);
            }

            if (filterRequest.StartTimeTo.HasValue)
            {
                query = query.Where(s => s.StartTime <= filterRequest.StartTimeTo.Value);
            }

            if (filterRequest.ClassId.HasValue)
            {
                query = query.Where(s => s.Section.Class.ClassId == filterRequest.ClassId.Value);
            }

            if (filterRequest.IsPracticeGroup.HasValue)
            {
                if (filterRequest.IsPracticeGroup.Value)
                {
                    query = query.Where(s => s.PracticeGroupId.HasValue);
                }
                else
                {
                    query = query.Where(s => !s.PracticeGroupId.HasValue);
                }
            }

            if (filterRequest.PracticeGroupId.HasValue)
            {
                query = query.Where(s => s.PracticeGroupId == filterRequest.PracticeGroupId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filterRequest.SectionCode))
            {
                query = query.Where(s => !string.IsNullOrEmpty(s.Section.SectionCode) &&
                                       s.Section.SectionCode.Contains(filterRequest.SectionCode.Trim()));
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filterRequest.SortBy?.ToLower() switch
            {
                "coursecode" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Section.CurriculumCourse.Course.CourseCode)
                    : query.OrderBy(s => s.Section.CurriculumCourse.Course.CourseCode),
                "coursename" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Section.CurriculumCourse.Course.CourseName)
                    : query.OrderBy(s => s.Section.CurriculumCourse.Course.CourseName),
                "lecturer" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Section.Lecturer.User.FullName)
                    : query.OrderBy(s => s.Section.Lecturer.User.FullName),
                "dayofweek" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.DayOfWeek)
                    : query.OrderBy(s => s.DayOfWeek),
                "starttime" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.StartTime)
                    : query.OrderBy(s => s.StartTime),
                "room" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Room)
                    : query.OrderBy(s => s.Room),
                "semester" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Section.Semester.Year).ThenByDescending(s => s.Section.Semester.Term)
                    : query.OrderBy(s => s.Section.Semester.Year).ThenBy(s => s.Section.Semester.Term),
                "date" => filterRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Date)
                    : query.OrderBy(s => s.Date),
                _ => query.OrderBy(s => s.Section.Semester.Year)
                    .ThenBy(s => s.Section.Semester.Term)
                    .ThenBy(s => s.Section.CurriculumCourse.Course.CourseCode)
                    .ThenBy(s => s.DayOfWeek)
                    .ThenBy(s => s.StartTime)
            };

            // Apply pagination
            var schedules = await query
                .Skip((filterRequest.PageNumber - 1) * filterRequest.PageSize)
                .Take(filterRequest.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var responses = schedules.Select(schedule => new ScheduleListResponse
            {
                ScheduleId = schedule.ScheduleId,
                ScheduleType = schedule.ScheduleType?.Name ?? "Unknown",
                ScheduleTypeId = schedule.ScheduleType?.ScheduleTypeId ?? 0,

                // Section information
                SectionId = schedule.Section.SectionId,
                SectionCode = schedule.Section.SectionCode ?? $"SEC{schedule.Section.SectionId}",

                // Course information
                CourseId = schedule.Section.CurriculumCourse.Course.CourseId,
                CourseCode = schedule.Section.CurriculumCourse.Course.CourseCode,
                CourseName = schedule.Section.CurriculumCourse.Course.CourseName,
                Credits = schedule.Section.CurriculumCourse.Course.CreditsTheory + schedule.Section.CurriculumCourse.Course.CreditsLab,

                LecturerId = schedule.Section.Lecturer?.Id,
                LecturerName = schedule.Section.Lecturer?.User?.FullName ?? "Not Assigned",
                LecturerCode = schedule.Section.Lecturer?.LecturerCode ?? "",

                // Class information
                ClassId = schedule.Section.Class.ClassId,
                ClassName = schedule.Section.Class.ClassName,
                ClassCode = schedule.Section.Class.ClassCode,

                //// Semester information
                SemesterId = schedule.Section.Semester.SemesterId,
                SemesterName = $"{schedule.Section.Semester.Year} - {schedule.Section.Semester.Term}",
                Year = schedule.Section.Semester.Year,
                Term = schedule.Section.Semester.Term,

                // Schedule details
                DayOfWeek = schedule.DayOfWeek,
                DayOfWeekText = schedule.DayOfWeek.HasValue ? GetDayOfWeekInVietnamese(schedule.DayOfWeek.Value) : "",
                Date = schedule.Date,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                Duration = $"{schedule.StartTime:HH:mm} - {schedule.EndTime:HH:mm}",
                Room = schedule.Room ?? "",
                OnlineLink = schedule.OnlineLink,

                //// Practice Group information
                IsPracticeGroup = schedule.PracticeGroupId.HasValue,
                PracticeGroupId = schedule.PracticeGroupId,
                PracticeGroupName = schedule.PracticeGroup?.GroupName ?? "",

                // Section details
                SectionCapacity = schedule.Section.Capacity,
                SectionEnrolledCount = schedule.Section.EnrolledCount,
                SectionAvailableSlots = Math.Max(0, schedule.Section.Capacity - schedule.Section.EnrolledCount),

                //// Department information
                //DepartmentName = schedule.Section.CurriculumCourse.Program.Department.DepartmentName,
                //FacultyName = schedule.Section.CurriculumCourse.Program.Department.Faculty.FacultyName,

                //// Additional info
                //IsRecurring = schedule.DayOfWeek.HasValue && !schedule.Date.HasValue,
                //IsOneTimeEvent = schedule.Date.HasValue,
                IsExam = schedule.ScheduleType?.ScheduleTypeId == 3

            }).ToList();

            return new PagedResult<ScheduleListResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = filterRequest.PageNumber,
                PageSize = filterRequest.PageSize
            };
        }

        private string GetDayOfWeekInVietnamese(DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
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

        public async Task<IEnumerable<ScheduleType>> GetAllScheduleType()
        {
            return await context.ScheduleTypes.ToListAsync();
        }

        public async Task<Schedule?> GetScheduleByIdAsync(int scheduleId)
        {
            return await context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                .Include(s => s.Section.Lecturer)
                .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesByDateAndStudentAsync(DateOnly date, string mssv, int scheduleTypeId)
        {
            // Xác định ngày đầu tuần (thứ 2) và ngày cuối tuần (chủ nhật) dựa trên ngày được truyền vào
            int dayOfWeek = (int)date.DayOfWeek;
            int daysToSubtract = dayOfWeek == 0 ? 6 : dayOfWeek - 1;

            DateOnly weekStart = date.AddDays(-daysToSubtract); // Ngày đầu tuần (thứ 2)
            DateOnly weekEnd = weekStart.AddDays(6);            // Ngày cuối tuần (chủ nhật)

            // Lấy thông tin sinh viên
            var student = await context.Students
                .FirstOrDefaultAsync(s => s.MSSV == mssv);

            if (student == null)
            {
                return new List<Schedule>();
            }

            // Lấy tất cả section ID mà sinh viên đã đăng ký và nằm trong khoảng thời gian hiệu lực
            var studentSections = await context.Enrollments
                .Where(e => e.Student.MSSV == mssv)
                .Include(e => e.Section)
                .Where(e =>
                    // Kiểm tra xem tuần hiện tại có nằm trong khoảng thời gian của section hay không
                    (e.Section.StartDate <= weekEnd && e.Section.EndDate >= weekStart)
                )
                .Select(e => e.Section.SectionId)
                .Distinct()
                .ToListAsync();

            if (!studentSections.Any())
            {
                return new List<Schedule>();
            }

            // Lấy các nhóm thực hành mà sinh viên đã đăng ký
            var studentPracticeGroups = await context.PracticeGroupEnrollments
                .Include(pge => pge.PracticeGroup)
                .Where(pge => pge.StudentId == student.Id && 
                             pge.IsActive &&
                             studentSections.Contains(pge.PracticeGroup.SectionId))
                .Select(pge => pge.PracticeGroupId)
                .ToListAsync();

            if (scheduleTypeId == 0)
            {
                // Nếu không truyền scheduleTypeId, lấy tất cả các loại lịch
                
                // Lấy lịch học chính (không phải lịch thi và không phải lịch thực hành)
                var regularSchedules = await context.Schedules
                    .Where(s =>
                        studentSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId != 3 && // Không phải lịch thi
                        !s.PracticeGroupId.HasValue // Không phải lịch thực hành
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();

                // Lấy lịch thực hành của các nhóm mà sinh viên đã đăng ký
                var practiceSchedules = await context.Schedules
                    .Where(s =>
                        s.PracticeGroupId.HasValue &&
                        studentPracticeGroups.Contains(s.PracticeGroupId.Value) &&
                        s.ScheduleType.ScheduleTypeId != 3 // Không phải lịch thi
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.PracticeGroup)
                    .ToListAsync();

                // Lấy lịch thi trong tuần này
                var examSchedules = await context.Schedules
                    .Where(s =>
                        studentSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == 3 && // Lịch thi
                        s.Date.HasValue && // Có ngày cụ thể
                        s.Date >= weekStart && s.Date <= weekEnd // Nằm trong tuần này
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();

                // Kết hợp tất cả lịch
                return regularSchedules.Concat(practiceSchedules).Concat(examSchedules);
            }
            else if (scheduleTypeId == 3) // Lịch thi
            {
                // Đối với lịch thi, chỉ lấy các lịch có ngày cụ thể trong tuần này
                return await context.Schedules
                    .Where(s =>
                        studentSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == 3 &&
                        s.Date.HasValue &&
                        s.Date >= weekStart && s.Date <= weekEnd
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();
            }
            else
            {
                // Các loại lịch khác - bao gồm cả lịch chính và lịch thực hành
                var regularSchedules = await context.Schedules
                    .Where(s =>
                        studentSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == scheduleTypeId &&
                        !s.PracticeGroupId.HasValue // Lịch chính
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();

                // Lấy lịch thực hành của cùng loại schedule type
                var practiceSchedules = await context.Schedules
                    .Where(s =>
                        s.PracticeGroupId.HasValue &&
                        studentPracticeGroups.Contains(s.PracticeGroupId.Value) &&
                        s.ScheduleType.ScheduleTypeId == scheduleTypeId
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.PracticeGroup)
                    .ToListAsync();

                return regularSchedules.Concat(practiceSchedules);
            }
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesByLecturerAsync(int lecturerId)
        {
            return await context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(s => s.Section.Lecturer)
                .Where(s => s.Section.Lecturer.Id == lecturerId)
                .ToListAsync();
        }

       

        public async Task<IEnumerable<Schedule>> GetSchedulesByStudentAsync(int studentId)
        {
            // Get all schedules based on the sections the student has enrolled in
            return await context.Enrollments
                .Where(e => e.Student.Id == studentId)
                .Select(e => e.Section.SectionId)
                .Distinct()
                .Join(context.Schedules,
                      sectionId => sectionId,
                      schedule => schedule.Section.SectionId,
                      (sectionId, schedule) => schedule)
                .Include(s => s.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(s => s.Section.Lecturer)
               
                .ToListAsync();
        }

        public async Task<Schedule?> UpdateScheduleAsync(int scheduleId, ScheduleRequest request)
        {
            var schedule = await context.Schedules.FindAsync(scheduleId);
            if (schedule is null)
            {
                return null;
            }

            if (schedule.Section.SectionId != request.SectionId)
            {
                var section = await context.Sections.FindAsync(request.SectionId);
                if (section is null)
                {
                    throw new Exception("Section not found");
                }
                schedule.Section = section;
            }

            // Check for conflicts only if time/room has changed
            if (schedule.DayOfWeek != request.DayOfWeek || 
                schedule.StartTime != request.StartTime ||
                schedule.EndTime != request.EndTime ||
                schedule.Room != request.Room)
            {
                var hasConflicts = await CheckScheduleConflictsAsync(
                    schedule.Section.SectionId,
                    request.Date,
                    request.DayOfWeek,
                    request.StartTime,
                    request.EndTime,
                    request.Room);

                if (hasConflicts)
                {
                    throw new Exception("Schedule conflicts with existing schedules");
                }
            }

            schedule.DayOfWeek = request.DayOfWeek;
            schedule.StartTime = request.StartTime;
            schedule.EndTime = request.EndTime;
            schedule.Room = request.Room;

            context.Schedules.Update(schedule);
            await context.SaveChangesAsync();
            return schedule;
        }
    }
}