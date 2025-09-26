using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IStudentService
    {
        Task<Student?> GetStudentByIdAsync(int studentId);
        Task<IEnumerable<Student>> GetAllStudentsAsync();
        Task<Student> CreateStudentAsync(StudentRequest student);
        Task<bool> DeleteStudentAsync(int studentId);
    }
}
