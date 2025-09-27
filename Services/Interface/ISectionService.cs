using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface ISectionService
    {
        Task<Section?> GetSectionByIdAsync(int sectionId);
        Task<IEnumerable<Section>> GetAllSectionsAsync();
        Task<Section> CreateSectionAsync(SectionRequest request);
        Task<bool> DeleteSectionAsync(int sectionId);
        Task<IEnumerable<Section>> GetSectionsByCourseAsync(int courseId);
    }
}