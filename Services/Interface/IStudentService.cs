using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IStudentService
    {
        Task<StudentDetailDto?> GetStudentByIdAsync(int studentId);
        Task<IEnumerable<Student>> GetAllStudentsAsync();
        Task<Student> CreateStudentAsync(StudentRequest student);
        Task<bool> DeleteStudentAsync(int studentId);
    }
}
