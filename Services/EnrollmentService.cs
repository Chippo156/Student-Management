using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
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

        public async Task<IEnumerable<Enrollment>> GetEnrollmentsByStudentIdAsync(int studentId)
        {
            var enrollments = context.Enrollments.Where(e => e.Student.Id == studentId)
                .Include(e => e.Section.CurriculumCourse)
                .Include(e => e.Section.Lecturer.User);
            return await enrollments.ToListAsync();
        }

        public Task<IEnumerable<Enrollment>> GetEnrollmentsByCourseIdAsync(int courseId)
        {
            var enrollments = context.Enrollments.Where(e => e.Student.Id == courseId);
            return Task.FromResult(enrollments.AsEnumerable());
        }
        public Task<IEnumerable<EnrollmentSemester>> GetEnrollmentBySemesterAsync(int semesterId, string mssv)
        {
           var enrollments = context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                .Where(e => e.Section.Semester.SemesterId == semesterId && e.Student.MSSV == mssv)
                .Select(e => new EnrollmentSemester
                {
                    courseCode = e.Section.CurriculumCourse.Course.CourseCode,
                    courseName = e.Section.CurriculumCourse.Course.CourseName,
                    creditsTheory = e.Section.CurriculumCourse.Course.CreditsTheory,
                    creditsLab = e.Section.CurriculumCourse.Course.CreditsLab,   
                });
            return Task.FromResult(enrollments.AsEnumerable());

        }
    }
}