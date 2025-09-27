using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IEnrollmentService
    {
        Task<Enrollment?> GetEnrollmentByIdAsync(int enrollmentId);
        Task<IEnumerable<Enrollment>> GetAllEnrollmentsAsync();
        Task<Enrollment> CreateEnrollmentAsync(EnrollmentRequest enrollmentRequest);
        Task<bool> DeleteEnrollmentAsync(int enrollmentId);
        Task<IEnumerable<Enrollment>> GetEnrollmentsByStudentIdAsync(int studentId);
        Task<IEnumerable<Enrollment>> GetEnrollmentsByCourseIdAsync(int courseId);
    }
}