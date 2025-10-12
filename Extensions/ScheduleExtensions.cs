using StudentManagement.Models;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Extensions
{
    public static class ScheduleExtensions
    {
        public static ScheduleResponse ToResponse(this Schedule schedule)
        {
            return new ScheduleResponse
            {
                ScheduleId = schedule.ScheduleId,
                CourseId = schedule.Section.Course.CourseId,
                CourseCode = schedule.Section.Course.CourseCode,
                CourseName = schedule.Section.Course.CourseName,
                ScheduleTypeId = schedule.ScheduleType.ScheduleTypeId,
                ScheduleTypeName = schedule.ScheduleType.Name ?? "Unknown",
                Date = schedule.Date,
                DayOfWeek = schedule.DayOfWeek,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                Room = schedule.Room,
                OnlineLink = schedule.OnlineLink,
                SectionId = schedule.Section.SectionId,
                LecturerName = schedule.Section.Lecturer?.User?.FullName ?? "Not Assigned"
            };
        }
        
        public static IEnumerable<ScheduleResponse> ToResponseList(this IEnumerable<Schedule> schedules)
        {
            return schedules.Select(s => s.ToResponse());
        }
    }
}