using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AdviserAssignmentService(AppDbContext context) : IAdviserAssignmentService
    {

        public async Task<bool> AssignLecturerToClass(int lecturerId, int classId)
        {
            Lecturer lecturer = await context.Lecturers.FindAsync(lecturerId) ?? throw new Exception("Lecturer not found");
            Class cls = await context.Classes.FindAsync(classId) ?? throw new Exception("Class not found");
            if (cls.AdviserAssignment != null)
            {
                throw new Exception("Class already has an adviser assigned");
            }
            AdviserAssignment assignment = new AdviserAssignment
            {
                Lecturer = lecturer,
                Class = cls
            };
            context.AdviserAssignments.Add(assignment);
            return await context.SaveChangesAsync() > 0;
        }

        public Task<Lecturer?> GetLecturerByAdviser(int adviserId)
        {
            AdviserAssignment? assignment = context.AdviserAssignments.Find(adviserId);
            return Task.FromResult(assignment?.Lecturer);
        }
    }
}
