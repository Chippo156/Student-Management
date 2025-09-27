using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IClassService
    {
        Task<Class?> GetClassByIdAsync(int classId);
        Task<IEnumerable<Class>> GetAllClassesAsync();
        Task<Class> CreateClassAsync(ClassRequest classRequest);
        Task<Class?> UpdateClassAsync(int classId, string className);
        Task<bool> DeleteClassAsync(int classId);   
    }
}