using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AdviserAssignmentService(AppDbContext context, IChatService chatService) : IAdviserAssignmentService
    {

        public async Task<bool> AssignLecturerToClass(int lecturerId, int classId)
        {
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == lecturerId)
                ?? throw new Exception("Lecturer not found");

            var cls = await context.Classes
                .Include(c => c.AdviserAssignment)
                    .ThenInclude(aa => aa.Lecturer)
                        .ThenInclude(l => l.User)
                .FirstOrDefaultAsync(c => c.ClassId == classId)
                ?? throw new Exception("Class not found");

            // **Lưu thông tin giáo viên cũ**
            string? oldLecturerUsername = cls.AdviserAssignment?.Lecturer?.User?.Username;

            if (cls.AdviserAssignment != null)
            {
                context.AdviserAssignments.Remove(cls.AdviserAssignment);
                cls.AdviserAssignment = null; // ⭐ QUAN TRỌNG
                await context.SaveChangesAsync();
            }

            var assignment = new AdviserAssignment
            {
                Lecturer = lecturer,
                ClassId = classId,
                StartDate = DateOnly.FromDateTime(DateTime.Now),
                EndDate = null,
                IsActive = true
            };

            context.AdviserAssignments.Add(assignment);
            cls.AdviserAssignment = assignment;

            var result = await context.SaveChangesAsync() > 0;

            // **Cập nhật chat rooms**
            if (result)
            {
                await chatService.UpdateClassTeacherChatRoomsAsync(
                    classId,
                    oldLecturerUsername,
                    lecturer.User.Username);
            }

            return result;
        }


        public Task<Lecturer?> GetLecturerByAdviser(int adviserId)
        {
            AdviserAssignment? assignment = context.AdviserAssignments.Find(adviserId);
            return Task.FromResult(assignment?.Lecturer);
        }
    }
}
