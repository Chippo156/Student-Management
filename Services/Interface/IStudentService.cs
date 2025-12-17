using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IStudentService
    {
        Task<StudentDetailDto?> GetStudentByIdAsync(int studentId);
        Task<PagedResult<Student>> GetAllStudentsAsync(PaginationParams pagination,
    string? search = null,
    string? className = null,
    int? departmentId = null,
    int? yearOfAdmission = null,
    StudentStatus? studentStatus = null);

        Task<Student> CreateStudentAsync(StudentRequest student);
        Task<bool> DeleteStudentAsync(int studentId);
        Task<IEnumerable<StudentDetailDto>> GetStudentsBySectionIdAsync(int sectionId);
        Task<StudentDetailDto?> GetStudentByMSSV(string MSSV);
        Task<StudentDetailDto?> UpdateStudentInformationAsync(string mssv, StudentUpdateRequest request);
        Task<PagedResult<StudentInSectionDto>> GetStudentsBySectionWithPaginationAsync(
            int sectionId, 
            PaginationParams pagination, 
            string? searchTerm = null);

        Task<PagedResult<StudentInSectionDto>> GetStudentsByLecturerWithPaginationAsync(
     string lecturerCode,
     PaginationParams pagination,
     string? searchTerm = null)
    }
}
