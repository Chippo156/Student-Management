using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ISectionService
    {
        Task<Section?> GetSectionByIdAsync(int sectionId);
        Task<IEnumerable<Section>> GetAllSectionsAsync();
        Task<Section> CreateSectionAsync(SectionRequest request);
        Task<bool> DeleteSectionAsync(int sectionId);
        Task<IEnumerable<Section>> GetSectionsByCourseAsync(int courseId);
        Task<IEnumerable<Section>> GetSectionsByLecturerAsync(int lecturerId);
        Task<IEnumerable<SectionDetailWithRegistrationResponse>> GetSectionsByCurriculumCourseAndSemesterAsync(int curriculumCourseId, int semesterId, string studentMSSV);
        Task<SectionScheduleWithRegistrationResponse?> GetSectionScheduleWithRegistrationAsync(int sectionId, string studentMSSV);
    }
}