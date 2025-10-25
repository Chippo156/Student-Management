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
            // Check for room conflicts at the same time
            var roomConflicts = await context.Schedules
                .Where(s => s.DayOfWeek == dayOfWeek &&
                            s.Date == dateEvent && 
                           s.Room == room &&
                           s.Section.SectionId != sectionId &&
                           ((s.StartTime <= startTime && s.EndTime > startTime) ||
                            (s.StartTime < endTime && s.EndTime >= endTime) ||
                            (s.StartTime >= startTime && s.EndTime <= endTime)))
                .AnyAsync();

            return roomConflicts;
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

            // Count regular class schedules (recurring schedules with DayOfWeek)
            int regularScheduleCount = await context.Schedules
                .Include(s => s.ScheduleType)
                .Where(s => studentSections.Contains(s.Section.SectionId) &&
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
                CountScheduleOfWeek = regularScheduleCount,
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

        public async Task<IEnumerable<Schedule>> GetAllSchedulesAsync()
        {
            return await context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.Course)
                .Include(s => s.Section.Lecturer)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleType>> GetAllScheduleType()
        {
            return await context.ScheduleTypes.ToListAsync();
        }

        public async Task<Schedule?> GetScheduleByIdAsync(int scheduleId)
        {
            return await context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.Course)
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

            if (scheduleTypeId == 0)
            {
                // Nếu không truyền scheduleTypeId, lấy tất cả các loại lịch
                var regularSchedules = await context.Schedules
                    .Where(s =>
                        // Chỉ lấy lịch học của các section mà sinh viên đã đăng ký và trong thời gian hiệu lực
                        studentSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId != 3 // Không phải lịch thi
                    )
                    .Include(s => s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();

                // Lấy lịch thi trong tuần này
                var examSchedules = await context.Schedules
                    .Where(s =>
                        studentSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == 3 && // Lịch thi
                        s.Date.HasValue && // Có ngày cụ thể
                        s.Date >= weekStart && s.Date <= weekEnd // Nằm trong tuần này
                    )
                    .Include(s=> s.ScheduleType)
                    .Include(s => s.Section)
                        .ThenInclude(s => s.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();

                // Kết hợp cả lịch học thường và lịch thi
                return regularSchedules.Concat(examSchedules);
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
                        .ThenInclude(s => s.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();
            }
            else
            {
                // Các loại lịch khác
                var result = await context.Schedules
                    .Where(s =>
                        studentSections.Contains(s.Section.SectionId) &&
                        s.ScheduleType.ScheduleTypeId == scheduleTypeId
                    )
                    .Include(s => s.ScheduleType)

                    .Include(s => s.Section)
                        .ThenInclude(s => s.Course)
                    .Include(s => s.Section.Lecturer)
                        .ThenInclude(l => l.User)
                    .ToListAsync();

                return result;
            }
        }


        public async Task<IEnumerable<Schedule>> GetSchedulesByLecturerAsync(int lecturerId)
        {
            return await context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.Course)
                .Include(s => s.Section.Lecturer)
                .Where(s => s.Section.Lecturer.Id == lecturerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesBySectionAsync(int sectionId)
        {
            return await context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.Course)
                .Include(s => s.Section.Lecturer)
                .Where(s => s.Section.SectionId == sectionId)
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
                    .ThenInclude(s => s.Course)
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