using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ICurriculumCourseService
    {
        Task<CurriculumCourse?> GetCurriculumCourseByIdAsync(int id);
        Task<IEnumerable<CurriculumCourse>> GetAllCurriculumCoursesAsync();
        Task<PagedResult<CurriculumCourseResponse>> GetAllCurriculumCoursesWithPaginationAsync(
              PaginationParams pagination,
              string? search = null,
              int? programId = null,
              int? departmentId = null);
        Task<IEnumerable<CurriculumCourse>> GetCurriculumCoursesByProgramAsync(int programId);
        Task<IEnumerable<CurriculumCourse>> GetCurriculumCoursesBySemesterAsync(int programId, int semester);
        Task<CurriculumCourse> CreateCurriculumCourseAsync(CurriculumCourseRequest request);
        Task<CurriculumCourse?> UpdateCurriculumCourseAsync(int id, CurriculumCourseRequest request);
        Task<bool> DeleteCurriculumCourseAsync(int id);
        Task<IEnumerable<CourseByStudentDepartmentResponse>> GetCoursesByStudentDepartmentAsync(string mssv, int? semesterId = null, CourseFilterType? filterType = null);
    }
}