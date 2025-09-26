using StudentManagement.Models;
using System.Threading.Tasks;

namespace StudentManagement.Services.Interface
{
    public interface IDepartmentService
    {
        Task<Department?> GetDepartmentByIdAsync(int departmentId);
        Task<IEnumerable<Department>> GetAllDepartmentsAsync();
        Task<Department> CreateDepartmentAsync(string departmentName, int facultyId);
        Task<Department?> UpdateDepartmentAsync(int departmentId, string newDepartmentName);
        Task<bool> DeleteDepartmentAsync(int departmentId);
    }
}
