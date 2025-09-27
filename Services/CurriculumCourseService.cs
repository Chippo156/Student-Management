using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class CurriculumCourseService(AppDbContext context) : ICurriculumCourseService
    {
        public async Task<CurriculumCourse> CreateCurriculumCourseAsync(CurriculumCourseRequest request)
        {
            var program = await context.Programs.FindAsync(request.ProgramId)
                ?? throw new Exception("Program not found");
                
            var course = await context.Courses.FindAsync(request.CourseId)
                ?? throw new Exception("Course not found");

            var curriculumCourse = new CurriculumCourse
            {
                Program = program,
                Course = course,
                isRequired = request.IsRequired,
                SemeterSuggested = request.SemesterSuggested
            };

            context.CurriculumCourses.Add(curriculumCourse);
            await context.SaveChangesAsync();
            return curriculumCourse;
        }

        public async Task<bool> DeleteCurriculumCourseAsync(int id)
        {
            var curriculumCourse = await context.CurriculumCourses.FindAsync(id);
            if (curriculumCourse is null)
            {
                return false;
            }

            context.CurriculumCourses.Remove(curriculumCourse);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<CurriculumCourse>> GetAllCurriculumCoursesAsync()
        {
            return await context.CurriculumCourses
                .Include(cc => cc.Program)
                .Include(cc => cc.Course)
                .ToListAsync();
        }

        public async Task<CurriculumCourse?> GetCurriculumCourseByIdAsync(int id)
        {
            return await context.CurriculumCourses
                .Include(cc => cc.Program)
                .Include(cc => cc.Course)
                .FirstOrDefaultAsync(cc => cc.Id == id);
        }

        public async Task<IEnumerable<CurriculumCourse>> GetCurriculumCoursesByProgramAsync(int programId)
        {
            return await context.CurriculumCourses
                .Include(cc => cc.Program)
                .Include(cc => cc.Course)
                .Where(cc => cc.Program.AcademicProgramId == programId)
                .ToListAsync();
        }

        public async Task<IEnumerable<CurriculumCourse>> GetCurriculumCoursesBySemesterAsync(int programId, int semester)
        {
            return await context.CurriculumCourses
                .Include(cc => cc.Program)
                .Include(cc => cc.Course)
                .Where(cc => cc.Program.AcademicProgramId == programId && cc.SemeterSuggested == semester)
                .ToListAsync();
        }

        public async Task<CurriculumCourse?> UpdateCurriculumCourseAsync(int id, CurriculumCourseRequest request)
        {
            var curriculumCourse = await context.CurriculumCourses.FindAsync(id);
            if (curriculumCourse is null)
            {
                return null;
            }

            var program = await context.Programs.FindAsync(request.ProgramId)
                ?? throw new Exception("Program not found");

            var course = await context.Courses.FindAsync(request.CourseId)
                ?? throw new Exception("Course not found");

            curriculumCourse.Program = program;
            curriculumCourse.Course = course;
            curriculumCourse.isRequired = request.IsRequired;
            curriculumCourse.SemeterSuggested = request.SemesterSuggested;

            context.CurriculumCourses.Update(curriculumCourse);
            await context.SaveChangesAsync();
            return curriculumCourse;
        }
    }
}