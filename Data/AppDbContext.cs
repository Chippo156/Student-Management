using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StudentManagement.Models;
using File = StudentManagement.Models.File;

namespace StudentManagement.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<Lecturer> Lecturers { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<Class> Classes { get; set; } = null!;
        public DbSet<AdviserAssignment> AdviserAssignments { get; set; } = null!;
        public DbSet<Course> Courses { get; set; } = null!;
        public DbSet<Section> Sections { get; set; } = null!;
        public DbSet<Enrollment> Enrollments { get; set; } = null!;
        public DbSet<Grade> Grades { get; set; } = null!;
        public DbSet<Announcement> Announcements { get; set; } = null!;
        public DbSet<CurriculumCourse> CurriculumCourses { get; set; } = null!;
        public DbSet<DocumentRequest> DocumentRequests { get; set; } = null!;
        public DbSet<DocumentType> DocumentTypes { get; set; } = null!;
        public DbSet<File> Files { get; set; } = null!;
        public DbSet<FinalResult> FinalResults { get; set; } = null!;
        public DbSet<GeneratedDocument> GeneratedDocuments { get; set; } = null!;
        public DbSet<GpaSnapshot> GpaSnapshots { get; set; } = null!;
        public DbSet<Notification> notifications { get; set; } = null!;
        public DbSet<Prerequisite> Prerequisites { get; set; } = null!;
        public DbSet<Schedule> Schedules { get; set; } = null!;
        public DbSet<Semester> Semesters { get; set; } = null!;
    }
}
