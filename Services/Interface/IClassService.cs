using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IClassService
    {
        Task<Class?> GetClassByIdAsync(int classId);
        Task<IEnumerable<Class>> GetAllClassesAsync();
        Task<Class> CreateClassAsync(ClassRequest classRequest);
        Task<Class?> UpdateClassAsync(int classId, string className);
        Task<bool> DeleteClassAsync(int classId);

        // Dropdown methods
        Task<IEnumerable<ClassDropdownResponse>> GetClassesDropdownAsync();
        Task<IEnumerable<ClassDropdownResponse>> GetClassesByProgramDropdownAsync(int programId);
        Task<IEnumerable<ClassDropdownResponse>> GetClassesByDepartmentDropdownAsync(int departmentId);

        Task<PagedResult<ClassResponse>> GetClassesWithPaginationAsync(
            PaginationParams pagination,
            string? search = null,
            int? programId = null);
    }
}