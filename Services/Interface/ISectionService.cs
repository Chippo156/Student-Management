using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ISectionService
    {
        Task<SectionListResponse?> GetSectionByIdAsync(int sectionId);
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
        Task<PagedResult<SectionSimpleResponse>> GetSectionsIsStartingByLecturerAsync(string lecturerCode);
        Task<SectionDetailWithScheduleResponse?> GetSectionDetailWithScheduleAsync(int sectionId, bool isPracticeSchedule = false, int? practiceGroupId = null);
        Task<Section?> UpdateSectionAsync(int sectionId, UpdateSectionRequest request);

        // Dropdown methods for Section creation/update
        Task<IEnumerable<CurriculumCourseDropdownResponse>> GetCurriculumCoursesDropdownAsync();
        Task<IEnumerable<LecturerDropdownResponse>> GetLecturersDropdownAsync();
        Task<IEnumerable<SemesterDropdownResponse>> GetSemestersDropdownAsync();
        Task<IEnumerable<ClassDropdownResponse>> GetClassesDropdownAsync();
        Task<IEnumerable<ClassDropdownResponse>> GetClassesByProgramDropdownAsync(int programId);

        Task<SectionExamListResponse> GetSectionExamListAsync(int sectionId);
    }
}