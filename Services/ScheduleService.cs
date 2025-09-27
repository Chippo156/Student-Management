using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class ScheduleService(AppDbContext context) : IScheduleService
    {
        public async Task<bool> CheckScheduleConflictsAsync(int sectionId, DayOfWeek dayOfWeek, TimeOnly startTime, TimeOnly endTime, string room)
        {
            // Check for room conflicts at the same time
            var roomConflicts = await context.Schedules
                .Where(s => s.DayOfWeek == dayOfWeek &&
                           s.Room == room &&
                           s.Section.SectionId != sectionId &&
                           ((s.StartTime <= startTime && s.EndTime > startTime) ||
                            (s.StartTime < endTime && s.EndTime >= endTime) ||
                            (s.StartTime >= startTime && s.EndTime <= endTime)))
                .AnyAsync();

            return roomConflicts;
        }

        public async Task<Schedule> CreateScheduleAsync(ScheduleRequest request)
        {
            var section = await context.Sections.FindAsync(request.SectionId)
                ?? throw new Exception("Section not found");

            // Check for conflicts
            var hasConflicts = await CheckScheduleConflictsAsync(
                request.SectionId,
                request.DayOfWeek,
                request.StartTime,
                request.EndTime,
                request.Room);

            if (hasConflicts)
            {
                throw new Exception("Schedule conflicts with existing schedules");
            }

            var schedule = new Schedule
            {
                Section = section,
                DayOfWeek = request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Room = request.Room
            };

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

        public async Task<Schedule?> GetScheduleByIdAsync(int scheduleId)
        {
            return await context.Schedules
                .Include(s => s.Section)
                    .ThenInclude(s => s.Course)
                .Include(s => s.Section.Lecturer)
                .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
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