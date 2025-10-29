using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IDepartmentService
    {
        Task<Department?> GetDepartmentByIdAsync(int departmentId);
        Task<IEnumerable<Department>> GetAllDepartmentsAsync();
        Task<Department> CreateDepartmentAsync(DepartmentRequest request);
        Task<Department?> UpdateDepartmentAsync(int departmentId, DepartmentRequest request);
        Task<bool> DeleteDepartmentAsync(int departmentId);
        
        // Dropdown methods
        Task<IEnumerable<DepartmentDropdownResponse>> GetDepartmentsDropdownAsync();
        Task<IEnumerable<DepartmentDropdownResponse>> GetDepartmentsByFacultyDropdownAsync(int facultyId);
    }
}
