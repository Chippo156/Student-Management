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

        public async Task<PagedResult<ScheduleListResponse>> GetAllSchedulesWithFiltersAsync(int sectionId)
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
                .Where(s => s.Section.SectionId == sectionId)
                .AsQueryable();

           
            // Get total count
            var totalCount = await query.CountAsync();

            // Map to response DTOs
            var responses = query.Select(schedule => new ScheduleListResponse
            {
                ScheduleId = schedule.ScheduleId,
                ScheduleType = schedule.ScheduleType.Name ?? "Unknown",

                // Section information
                SectionId = schedule.Section.SectionId,
                SectionCode = schedule.Section.SectionCode ?? $"SEC{schedule.Section.SectionId}",

                // Course information
                CourseId = schedule.Section.CurriculumCourse.Course.CourseId,
                CourseName = schedule.Section.CurriculumCourse.Course.CourseName,

                LecturerName = schedule.Section.Lecturer.User.FullName ?? "Not Assigned",

                // Class information
                ClassId = schedule.Section.Class.ClassId,
                ClassName = schedule.Section.Class.ClassName,

                //// Semester information
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
                PracticeGroupName = schedule.PracticeGroup.GroupName ?? "",
                PracticeGroupCapacity = schedule.PracticeGroup != null ? schedule.PracticeGroup.CurrentCount : null,

                // Section details
                IsExam = schedule.ScheduleType.ScheduleTypeId == 3

            }).ToList();

            return new PagedResult<ScheduleListResponse>
            {
                Items = responses,
                TotalCount = totalCount,
            };
        }

        private static string GetDayOfWeekInVietnamese(DayOfWeek dayOfWeek)
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

        public async Task<IEnumerable<Schedule>> GetSchedulesByDateAndLecturerAsync(DateOnly date, string lecturerCode, int scheduleTypeId)
        {
            // Xác định ngày đầu tuần (thứ 2) và ngày cuối tuần (chủ nhật) dựa trên ngày được truyền vào
            int dayOfWeek = (int)date.DayOfWeek;
            int daysToSubtract = dayOfWeek == 0 ? 6 : dayOfWeek - 1;

            DateOnly weekStart = date.AddDays(-daysToSubtract); // Ngày đầu tuần (thứ 2)
            DateOnly weekEnd = weekStart.AddDays(6);            // Ngày cuối tuần (chủ nhật)

            // Lấy thông tin giáo viên
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.User.Username == lecturerCode);

            if (lecturer == null)
            {
                return new List<Schedule>();
            }

            // Lấy tất cả section ID mà giáo viên đang giảng dạy và nằm trong khoảng thời gian hiệu lực
            var lecturerSections = await context.Sections
                .Where(s => s.Lecturer.Id == lecturer.Id &&
                           s.StartDate <= weekEnd && s.EndDate >= weekStart)
                .Select(s => s.SectionId)
                .Distinct()
                .ToListAsync();

            if (!lecturerSections.Any())
            {
                return new List<Schedule>();
            }

            // Lấy các nhóm thực hành mà giáo viên đang phụ trách (nếu có)
            var lecturerPracticeGroups = await context.PracticeGroups
                .Include(pg => pg.Section)
                .Where(pg => pg.LecturerId == lecturer.Id &&
                            pg.IsActive &&
                            lecturerSections.Contains(pg.SectionId))
                .Select(pg => pg.PracticeGroupId)
                .ToListAsync();

            if (scheduleTypeId == 0)
            {
                // Nếu không truyền scheduleTypeId, lấy tất cả các loại lịch

                // Lấy lịch giảng dạy chính (không phải lịch thi và không phải lịch thực hành)
                var regularSchedules = await context.Schedules
                    .Where(s =>
                        lecturerSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId != 3 && // Không phải lịch thi
                        !s.PracticeGroupId.HasValue // Không phải lịch thực hành
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Section.Class)
                    .ToListAsync();

                // Lấy lịch thực hành mà giáo viên đang phụ trách
                var practiceSchedules = await context.Schedules
                    .Where(s =>
                        s.PracticeGroupId.HasValue &&
                        lecturerPracticeGroups.Contains(s.PracticeGroupId.Value) &&
                        s.ScheduleType.ScheduleTypeId != 3 // Không phải lịch thi
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Section.Class)
                    .Include(s => s.PracticeGroup)
                    .ToListAsync();

                // Lấy lịch thi trong tuần này (giáo viên coi thi)
                var examSchedules = await context.Schedules
                    .Where(s =>
                        lecturerSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == 3 && // Lịch thi
                        s.Date.HasValue && // Có ngày cụ thể
                        s.Date >= weekStart && s.Date <= weekEnd // Nằm trong tuần này
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Section.Class)
                    .ToListAsync();

                // Kết hợp tất cả lịch
                return regularSchedules.Concat(practiceSchedules).Concat(examSchedules);
            }
            else if (scheduleTypeId == 3) // Lịch thi
            {
                // Đối với lịch thi, chỉ lấy các lịch có ngày cụ thể trong tuần này
                return await context.Schedules
                    .Where(s =>
                        lecturerSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == 3 &&
                        s.Date.HasValue &&
                        s.Date >= weekStart && s.Date <= weekEnd
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Section.Class)
                    .ToListAsync();
            }
            else
            {
                // Các loại lịch khác - bao gồm cả lịch chính và lịch thực hành
                var regularSchedules = await context.Schedules
                    .Where(s =>
                        lecturerSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == scheduleTypeId &&
                        !s.PracticeGroupId.HasValue // Lịch chính
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Section.Class)
                    .ToListAsync();

                // Lấy lịch thực hành của cùng loại schedule type
                var practiceSchedules = await context.Schedules
                    .Where(s =>
                        s.PracticeGroupId.HasValue &&
                        lecturerPracticeGroups.Contains(s.PracticeGroupId.Value) &&
                        s.ScheduleType.ScheduleTypeId == scheduleTypeId
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.CurriculumCourse.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Section.Class)
                    .Include(s => s.PracticeGroup)
                    .ToListAsync();

                return regularSchedules.Concat(practiceSchedules);
            }
        }

        public async Task<CountSchedule> CountScheduleByLecturer(string lecturerCode)
        {
            // Get the current date
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);

            // Determine the start and end date of the current week
            int dayOfWeek = (int)today.DayOfWeek;
            int daysToSubtract = dayOfWeek == 0 ? 6 : dayOfWeek - 1;

            DateOnly weekStart = today.AddDays(-daysToSubtract); // Monday of current week
            DateOnly weekEnd = weekStart.AddDays(6);             // Sunday of current week

            // Lấy thông tin giáo viên
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.User.Username == lecturerCode);

            if (lecturer == null)
            {
                return new CountSchedule { CountScheduleOfWeek = 0, CountTestOfWeek = 0 };
            }

            // Get all sections that the lecturer is teaching and are active in the current week
            var lecturerSections = await context.Sections
                .Where(s => s.Lecturer.Id == lecturer.Id &&
                           s.StartDate <= weekEnd && s.EndDate >= weekStart)
                .Select(s => s.SectionId)
                .Distinct()
                .ToListAsync();

            if (lecturerSections.Count == 0)
            {
                return new CountSchedule { CountScheduleOfWeek = 0, CountTestOfWeek = 0 };
            }

            // Lấy các nhóm thực hành mà giáo viên đang phụ trách
            var lecturerPracticeGroups = await context.PracticeGroups
                .Where(pg => pg.LecturerId == lecturer.Id &&
                            pg.IsActive &&
                            lecturerSections.Contains(pg.SectionId))
                .Select(pg => pg.PracticeGroupId)
                .ToListAsync();

            // Count regular class schedules (recurring schedules with DayOfWeek) - không bao gồm lịch thực hành
            int regularScheduleCount = await context.Schedules
                .Include(s => s.ScheduleType)
                .Where(s => lecturerSections.Contains(s.Section.SectionId) &&
                           s.ScheduleType.ScheduleTypeId != 3 && // Not exam schedules
                           s.DayOfWeek.HasValue && // Regular recurring schedules
                           !s.PracticeGroupId.HasValue) // Không phải lịch thực hành
                .CountAsync();

            // Count practice schedules của giáo viên
            int practiceScheduleCount = await context.Schedules
                .Include(s => s.ScheduleType)
                .Where(s => s.PracticeGroupId.HasValue &&
                           lecturerPracticeGroups.Contains(s.PracticeGroupId.Value) &&
                           s.ScheduleType.ScheduleTypeId != 3 && // Not exam schedules
                           s.DayOfWeek.HasValue) // Regular recurring schedules
                .CountAsync();

            // Count exam schedules (one-time events with specific dates in current week)
            int examScheduleCount = await context.Schedules
                .Include(s => s.ScheduleType)
                .Where(s => lecturerSections.Contains(s.Section.SectionId) &&
                           s.ScheduleType.ScheduleTypeId == 3 && // Exam schedules
                           s.Date.HasValue && // Has specific date
                           s.Date >= weekStart && s.Date <= weekEnd) // Within current week
                .CountAsync();

            return new CountSchedule
            {
                CountScheduleOfWeek = regularScheduleCount + practiceScheduleCount,
                CountTestOfWeek = examScheduleCount
            };
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