using StudentManagement.Models;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ISemesterService
    {
        Task<IEnumerable<SemesterStudentAdmission>> GetSemestersByStudentAdmissionAsync(string mssv);
        Task<IEnumerable<Semester>> GetSemestersByStudentAdmissionAndEnrollmentAsync(string mssv);

    }
}
