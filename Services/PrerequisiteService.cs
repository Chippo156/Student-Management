using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class PrerequisiteService(AppDbContext context) : IPrerequisiteService
    {
        public async Task<Prerequisite> CreatePrerequisiteAsync(PrerequisiteRequest request)
        {
            var course = await context.Courses.FindAsync(request.CourseId)
                ?? throw new Exception("Course not found");
            
            var prerequisiteCourse = await context.Courses.FindAsync(request.PrerequisiteCourseId)
                ?? throw new Exception("Prerequisite course not found");
            
            var hasCircularDependency = await CheckCircularDependencyAsync(request.CourseId, request.PrerequisiteCourseId);
            if (hasCircularDependency)
            {
                throw new Exception("Adding this prerequisite would create a circular dependency");
            }

            var prerequisite = new Prerequisite
            {
                Course = course,
                PrerequisiteCourse = prerequisiteCourse
            };

            context.Prerequisites.Add(prerequisite);
            await context.SaveChangesAsync();
            return prerequisite;
        }

        public async Task<bool> DeletePrerequisiteAsync(int prerequisiteId)
        {
            var prerequisite = await context.Prerequisites.FindAsync(prerequisiteId);
            if (prerequisite is null)
            {
                return false;
            }

            context.Prerequisites.Remove(prerequisite);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Prerequisite>> GetAllPrerequisitesAsync()
        {
            return await context.Prerequisites
                .Include(p => p.Course)
                .Include(p => p.PrerequisiteCourse)
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetCoursesRequiringPrerequisiteAsync(int courseId)
        {
            return await context.Prerequisites
                .Where(p => p.PrerequisiteCourse.CourseId == courseId)
                .Select(p => p.Course)
                .ToListAsync();
        }

        public async Task<Prerequisite?> GetPrerequisiteByIdAsync(int prerequisiteId)
        {
            return await context.Prerequisites
                .Include(p => p.Course)
                .Include(p => p.PrerequisiteCourse)
                .FirstOrDefaultAsync(p => p.Id == prerequisiteId);
        }

        public async Task<IEnumerable<Course>> GetPrerequisiteCoursesForCourseAsync(int courseId)
        {
            return await context.Prerequisites
                .Where(p => p.Course.CourseId == courseId)
                .Select(p => p.PrerequisiteCourse)
                .ToListAsync();
        }

        private async Task<bool> CheckCircularDependencyAsync(int courseId, int prerequisiteCourseId)
        {
            // Check if the prerequisite course has the original course as a prerequisite (direct cycle)
            var directCycle = await context.Prerequisites
                .AnyAsync(p => p.Course.CourseId == prerequisiteCourseId && 
                               p.PrerequisiteCourse.CourseId == courseId);
            
            if (directCycle)
            {
                return true;
            }

            // Check for indirect cycles
            var visited = new HashSet<int>();
            return await HasCircularDependencyDfs(prerequisiteCourseId, courseId, visited);
        }

        private async Task<bool> HasCircularDependencyDfs(int currentCourseId, int targetCourseId, HashSet<int> visited)
        {
            if (currentCourseId == targetCourseId)
            {
                return true;
            }

            if (visited.Contains(currentCourseId))
            {
                return false;
            }

            visited.Add(currentCourseId);

            var prerequisites = await context.Prerequisites
                .Where(p => p.Course.CourseId == currentCourseId)
                .Select(p => p.PrerequisiteCourse.CourseId)
                .ToListAsync();

            foreach (var prerequisiteId in prerequisites)
            {
                if (await HasCircularDependencyDfs(prerequisiteId, targetCourseId, visited))
                {
                    return true;
                }
            }

            return false;
        }
    }
}