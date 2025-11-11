using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

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
        Task<IEnumerable<EnrollmentSemester>> GetEnrollmentBySemesterAsync(int semesterId, string mssv);
        Task<EnrollmentResultResponse> EnrollInCourseAsync(string mssv, CourseEnrollmentRequest request);
        Task<IEnumerable<EnrolledSectionResponse>> GetEnrolledSectionsBySemesterAsync(string mssv, int semesterId);
        Task<EnrollmentResultResponse> DropEnrollmentAsync(string mssv, int sectionId);
        Task<PagedResult<EnrollmentListResponse>> GetEnrollmentsWithPaginationAsync(
            PaginationParams pagination,
            string? search = null,
            EnrollmentStatus? enrollmentStatus = null,
            int? semesterId = null);
    }
}