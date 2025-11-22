using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AdviserAssignmentService(AppDbContext context) : IAdviserAssignmentService
    {

        public async Task<bool> AssignLecturerToClass(int lecturerId, int classId)
        {
            Lecturer lecturer = await context.Lecturers.FindAsync(lecturerId) ?? throw new System.Exception("Lecturer not found");
            Class cls = await context.Classes.FindAsync(classId) ?? throw new System.Exception("Class not found");

            if (cls.AdviserAssignment != null)
            {
                throw new System.Exception("Lớp đã được phân công giáo viên chủ nhiệm");
            }
            AdviserAssignment assignment = new AdviserAssignment
            {
                Lecturer = lecturer,
                StartDate = DateOnly.FromDateTime(DateTime.Now),
                EndDate = null,
                ClassId = classId,
                Class = cls,
                IsActive = true

            };
            context.AdviserAssignments.Add(assignment);
            cls.AdviserAssignment = assignment;
            return await context.SaveChangesAsync() > 0;
        }

        public Task<Lecturer?> GetLecturerByAdviser(int adviserId)
        {
            AdviserAssignment? assignment = context.AdviserAssignments.Find(adviserId);
            return Task.FromResult(assignment?.Lecturer);
        }
    }
}
