using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class CourseService(AppDbContext context) : ICourseService
    {
        public Task<Course> CreateCourseAsync(CourseRequest courseRequest)
        {
            Course newCourse = new Course
            {
                CourseName = courseRequest.CourseName,
                CourseCode = courseRequest.CourseCode,
                CreditsTheory = courseRequest.CreditsTheory,
                CreditsLab = courseRequest.CreditsLab
            };
            context.Courses.Add(newCourse);
            context.SaveChanges();
            return Task.FromResult(newCourse);
        }

        public Task<bool> DeleteCourseAsync(int courseId)
        {
            Course course = context.Courses.Find(courseId) ?? throw new Exception("Course not found");
            context.Courses.Remove(course);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public Task<IEnumerable<Course>> GetAllCoursesAsync()
        {
            return Task.FromResult(context.Courses.AsEnumerable());
        }

        public Task<Course?> GetCourseByIdAsync(int courseId)
        {
            Course? course = context.Courses.Find(courseId);
            return Task.FromResult(course);
        }

        public Task<Course?> UpdateCourseAsync(int courseId, CourseRequest courseRequest)
        {
            Course? course = context.Courses.Find(courseId);
            if (course is null)
            {
                return Task.FromResult<Course?>(null);
            }

            course.CourseName = courseRequest.CourseName;
            course.CourseCode = courseRequest.CourseCode;
            course.CreditsTheory = courseRequest.CreditsTheory;
            course.CreditsLab = courseRequest.CreditsLab;

            context.Courses.Update(course);
            context.SaveChanges();
            return Task.FromResult<Course?>(course);
        }
    }
}