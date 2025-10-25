using StudentManagement.Models;

namespace StudentManagement.Services.Interface
{
    public interface ISemesterService
    {
        Task<IEnumerable<Semester>> GetSemestersByStudentAdmissionAsync(string mssv);
        Task<IEnumerable<Semester>> GetSemestersByStudentAdmissionAndEnrollmentAsync(string mssv);

    }
}
