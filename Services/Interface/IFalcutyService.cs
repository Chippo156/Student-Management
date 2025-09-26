using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using System.Threading.Tasks;

namespace StudentManagement.Services.Interface
{
    public interface IFalcutyService
    {
        Task<Faculty?> GetFacultyByIdAsync(int facultyId);
        Task<IEnumerable<Faculty>> GetAllFacultiesAsync();
        Task<Faculty> CreateFacultyAsync(FacultyRequest faculty);
        Task<Faculty?> UpdateFacultyAsync(int facultyId, FacultyRequest faculty);
        Task<bool> DeleteFacultyAsync(int facultyId);
    }
}
