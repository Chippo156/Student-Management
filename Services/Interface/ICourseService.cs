using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface ICourseService
    {
        Task<Course?> GetCourseByIdAsync(int courseId);
        Task<IEnumerable<Course>> GetAllCoursesAsync();
        Task<Course> CreateCourseAsync(CourseRequest courseRequest);
        Task<Course?> UpdateCourseAsync(int courseId, CourseRequest courseRequest);
        Task<bool> DeleteCourseAsync(int courseId);
    }
}