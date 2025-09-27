using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class EnrollmentService(AppDbContext context) : IEnrollmentService
    {
        public Task<Enrollment> CreateEnrollmentAsync(EnrollmentRequest enrollmentRequest)
        {
            var student = context.Students.Find(enrollmentRequest.StudentId);
            if (student is null)
            {
                throw new Exception("Student not found");
            }
            
            var section = context.Sections.Find(enrollmentRequest.SectionId);
            if (section is null)
            {
                throw new Exception("Course not found");
            }

            Enrollment newEnrollment = new Enrollment
            {
                Student = student,
                Section = section,
                RegisteredAt = DateTime.Now,
                enrollmentStatus = EnrollmentStatus.Enrolled,
            };

            context.Enrollments.Add(newEnrollment);
            context.SaveChanges();
            return Task.FromResult(newEnrollment);
        }

        public Task<bool> DeleteEnrollmentAsync(int enrollmentId)
        {
            Enrollment enrollment = context.Enrollments.Find(enrollmentId) ?? throw new Exception("Enrollment not found");
            context.Enrollments.Remove(enrollment);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public Task<IEnumerable<Enrollment>> GetAllEnrollmentsAsync()
        {
            return Task.FromResult(context.Enrollments.AsEnumerable());
        }

        public Task<Enrollment?> GetEnrollmentByIdAsync(int enrollmentId)
        {
            Enrollment? enrollment = context.Enrollments.Find(enrollmentId);
            return Task.FromResult(enrollment);
        }

        public Task<IEnumerable<Enrollment>> GetEnrollmentsByStudentIdAsync(int studentId)
        {
            var enrollments = context.Enrollments.Where(e => e.Student.Id == studentId);
            return Task.FromResult(enrollments.AsEnumerable());
        }

        public Task<IEnumerable<Enrollment>> GetEnrollmentsByCourseIdAsync(int courseId)
        {
            var enrollments = context.Enrollments.Where(e => e.Student.Id == courseId);
            return Task.FromResult(enrollments.AsEnumerable());
        }
    }
}