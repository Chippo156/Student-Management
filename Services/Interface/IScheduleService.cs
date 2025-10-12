using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IScheduleService
    {
        Task<Schedule?> GetScheduleByIdAsync(int scheduleId);
        Task<IEnumerable<Schedule>> GetAllSchedulesAsync();
        Task<Schedule> CreateScheduleAsync(ScheduleRequest request);
        Task<Schedule?> UpdateScheduleAsync(int scheduleId, ScheduleRequest request);
        Task<bool> DeleteScheduleAsync(int scheduleId);
        Task<IEnumerable<Schedule>> GetSchedulesBySectionAsync(int sectionId);
        Task<IEnumerable<Schedule>> GetSchedulesByLecturerAsync(int lecturerId);
        Task<IEnumerable<Schedule>> GetSchedulesByStudentAsync(int studentId);
        Task<IEnumerable<Schedule>> GetSchedulesByDateAndStudentAsync(DateOnly date, string mssv, int scheduleTypeId);

        Task<bool> CheckScheduleConflictsAsync(int sectionId, DateOnly? dateEvent, DayOfWeek? dayOfWeek, TimeOnly startTime, TimeOnly endTime, string room);
        Task<CountSchedule> countSchedule(string mssv);
        Task<IEnumerable<ScheduleType>> GetAllScheduleType();
    }
}