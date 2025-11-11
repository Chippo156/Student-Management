using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ISectionService
    {
        Task<Section?> GetSectionByIdAsync(int sectionId);
        Task<IEnumerable<Section>> GetAllSectionsAsync();
        Task<PagedResult<SectionListResponse>> GetAllSectionsWithPaginationAsync(
            PaginationParams pagination,
            string? search = null,
            SectionStatus? status = null,
            int? semesterId = null);
        Task<PagedResult<SectionListResponse>> GetSectionsWithPaginationAsync(SectionSearchRequest searchRequest);
        Task<IEnumerable<Section>> GetSectionsByCourseAsync(int courseId);
        Task<IEnumerable<Section>> GetSectionsByLecturerAsync(int lecturerId);
        Task<Section> CreateSectionAsync(SectionRequest request);
        Task<bool> DeleteSectionAsync(int sectionId);
        Task<IEnumerable<SectionDetailWithRegistrationResponse>> GetSectionsByCurriculumCourseAndSemesterAsync(int curriculumCourseId, int semesterId, string studentMSSV);
        Task<SectionScheduleWithRegistrationResponse?> GetSectionScheduleWithRegistrationAsync(int sectionId, string studentMSSV);
        Task<PagedResult<SectionSimpleResponse>> GetSectionsByLecturerAsync(SectionSearchRequest searchRequest, string lecturerCode);
        Task<IEnumerable<SectionDropdownResponse>> GetSectionDropdownForLecturerAsync(string lecturerCode, int? semesterId = null);
    }
}