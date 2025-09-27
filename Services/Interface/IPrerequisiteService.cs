using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IPrerequisiteService
    {
        Task<Prerequisite?> GetPrerequisiteByIdAsync(int prerequisiteId);
        Task<IEnumerable<Prerequisite>> GetAllPrerequisitesAsync();
        Task<Prerequisite> CreatePrerequisiteAsync(PrerequisiteRequest request);
        Task<bool> DeletePrerequisiteAsync(int prerequisiteId);
        Task<IEnumerable<Course>> GetPrerequisiteCoursesForCourseAsync(int courseId);
        Task<IEnumerable<Course>> GetCoursesRequiringPrerequisiteAsync(int courseId);
    }
}