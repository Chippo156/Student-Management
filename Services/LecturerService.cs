using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class LecturerService(AppDbContext context) : ILecturerService
    {
        public Task<Lecturer> CreateLecturerAsync(LecturerRequest lecturer)
        {
            User? user = context.Users.FirstOrDefault(u => u.UserId == lecturer.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            Department? department= context.Departments.FirstOrDefault(d => d.DepartmentId == lecturer.DepartmentId);
            if (department == null)
            {
                throw new Exception("Department not found");
            }
            var newLecturer = new Lecturer
            {
                User = user,
                Department = department,
                Position = lecturer.Position,
                AcademicTitle = lecturer.AcademicTitle,
            };
            context.Lecturers.Add(newLecturer);
            context.SaveChanges();
            return Task.FromResult(newLecturer);
        }

        public Task<bool> DeleteLecturerAsync(int lecturerId)
        {
           Lecturer lecturer = context.Lecturers.Find(lecturerId) ?? throw new Exception("Lecturer not found");
              context.Lecturers.Remove(lecturer);
              return Task.FromResult(context.SaveChanges() > 0);
        }

        public async Task<IEnumerable<Lecturer>> GetAllLecturersAsync()
        {
            return await context.Lecturers.Include(l => l.User).
                ToListAsync();
        }

        public async Task<Lecturer?> GetLecturerByIdAsync(int lecturerId)
        {
            return await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == lecturerId);
        }
    }
}
