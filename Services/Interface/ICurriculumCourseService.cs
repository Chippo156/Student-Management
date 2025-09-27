using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface ICurriculumCourseService
    {
        Task<CurriculumCourse?> GetCurriculumCourseByIdAsync(int id);
        Task<IEnumerable<CurriculumCourse>> GetAllCurriculumCoursesAsync();
        Task<IEnumerable<CurriculumCourse>> GetCurriculumCoursesByProgramAsync(int programId);
        Task<IEnumerable<CurriculumCourse>> GetCurriculumCoursesBySemesterAsync(int programId, int semester);
        Task<CurriculumCourse> CreateCurriculumCourseAsync(CurriculumCourseRequest request);
        Task<CurriculumCourse?> UpdateCurriculumCourseAsync(int id, CurriculumCourseRequest request);
        Task<bool> DeleteCurriculumCourseAsync(int id);
    }
}