using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class GpaSnapshotService(AppDbContext context) : IGpaSnapshotService
    {
        public async Task<GpaSnapshot> CreateGpaSnapshotAsync(GpaSnapshotRequest request)
        {
            var student = await context.Students.FindAsync(request.StudentId)
                ?? throw new Exception("Student not found");

            var semester = await context.Semesters.FindAsync(request.SemesterId)
                ?? throw new Exception("Semester not found");

            var gpaSnapshot = new GpaSnapshot
            {
                Student = student,
                Semester = semester,
                Gpa = request.GPA,
            };

            context.GpaSnapshots.Add(gpaSnapshot);
            await context.SaveChangesAsync();
            return gpaSnapshot;
        }

        public async Task<bool> DeleteGpaSnapshotAsync(int gpaSnapshotId)
        {
            var gpaSnapshot = await context.GpaSnapshots.FindAsync(gpaSnapshotId);
            if (gpaSnapshot is null)
            {
                return false;
            }

            context.GpaSnapshots.Remove(gpaSnapshot);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<GpaSnapshot>> GetAllGpaSnapshotsAsync()
        {
            return await context.GpaSnapshots
                .Include(g => g.Student)
                    .ThenInclude(s => s.User)
                .ToListAsync();
        }

        public async Task<GpaSnapshot?> GetGpaSnapshotByIdAsync(int gpaSnapshotId)
        {
            return await context.GpaSnapshots
                .Include(g => g.Student)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(g => g.GpaSnapshotId == gpaSnapshotId);
        }

        public async Task<IEnumerable<GpaSnapshot>> GetGpaSnapshotsByStudentAsync(int studentId)
        {
            return await context.GpaSnapshots
                .Include(g => g.Student)
                .Where(g => g.Student.Id == studentId)
                .ToListAsync();
        }

        public async Task<GpaSnapshot?> GetLatestGpaSnapshotByStudentAsync(int studentId)
        {
            return await context.GpaSnapshots
                .Include(g => g.Student)
                .Where(g => g.Student.Id == studentId)
                .FirstOrDefaultAsync();
        }

        public async Task<GpaSnapshot?> UpdateGpaSnapshotAsync(int gpaSnapshotId, GpaSnapshotRequest request)
        {
            var gpaSnapshot = await context.GpaSnapshots.FindAsync(gpaSnapshotId);
            if (gpaSnapshot is null)
            {
                return null;
            }

            if (gpaSnapshot.Student.Id != request.StudentId)
            {
                var student = await context.Students.FindAsync(request.StudentId);
                if (student is null)
                {
                    throw new Exception("Student not found");
                }
                gpaSnapshot.Student = student;
            }

            if (gpaSnapshot.Semester.SemesterId != request.SemesterId)
            {
                var semester = await context.Semesters.FindAsync(request.SemesterId);
                if (semester is null)
                {
                    throw new Exception("Semester not found");
                }
                gpaSnapshot.Semester = semester;
            }

            gpaSnapshot.Gpa = request.GPA;

            context.GpaSnapshots.Update(gpaSnapshot);
            await context.SaveChangesAsync();
            return gpaSnapshot;
        }
    }
}