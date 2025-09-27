using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using System.Threading.Tasks;

namespace StudentManagement.Services.Interface
{
    public interface IDepartmentService
    {
        Task<Department?> GetDepartmentByIdAsync(int departmentId);
        Task<IEnumerable<Department>> GetAllDepartmentsAsync();
        Task<Department> CreateDepartmentAsync(DepartmentRequest departmentRequest);
        Task<Department?> UpdateDepartmentAsync(int departmentId, string newDepartmentName);
        Task<bool> DeleteDepartmentAsync(int departmentId);
    }
}
