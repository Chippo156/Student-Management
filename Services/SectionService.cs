using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class SectionService(AppDbContext context) : ISectionService
    {
        public async Task<Section> CreateSectionAsync(SectionRequest request)
        {
            var curriculumCourse = await context.CurriculumCourses.FindAsync(request.CurriculumCourseId);
            if (curriculumCourse is null)
            {
                throw new Exception("CurriculumCourse not found");
            }

            var lecturer = await context.Lecturers.FindAsync(request.LecturerId);
            if (lecturer is null)
            {
                throw new Exception("Lecturer not found");
            }

            Semester? existingSemester = await context.Semesters.FindAsync(request.SemesterId);
            if (existingSemester is null)
            {
                throw new Exception("Semester not found");
            }

            var classSection = await context.Classes.FindAsync(request.ClassId);

            if (classSection is null)
            {
                throw new Exception("Class not found");
            }


            Section newSection = new Section
            {
                CurriculumCourse = curriculumCourse,
                Lecturer = lecturer,
                Semester = existingSemester,
                Class = classSection,
            };

            context.Sections.Add(newSection);
            await context.SaveChangesAsync();
            return newSection;
        }

        public async Task<bool> DeleteSectionAsync(int sectionId)
        {
            var section = await context.Sections.FindAsync(sectionId);
            if (section is null)
            {
                return false;
            }

            context.Sections.Remove(section);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Section>> GetAllSectionsAsync()
        {
            return await context.Sections
                .Include(s => s.CurriculumCourse)
                .Include(s => s.Lecturer)
                .Include(s => s.Semester)
                .ToListAsync();
        }

        public async Task<Section?> GetSectionByIdAsync(int sectionId)
        {
            return await context.Sections
                .Include(s => s.CurriculumCourse)
                .Include(s => s.Lecturer)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);
        }

        public async Task<IEnumerable<Section>> GetSectionsByCourseAsync(int courseId)
        {
            return await context.Sections
                .Include(s => s.CurriculumCourse)
                .Include(s => s.Lecturer)
                .Where(s => s.CurriculumCourse.Course.CourseId == courseId)
                .ToListAsync();
        }

        public Task<IEnumerable<Section>> GetSectionsByLecturerAsync(int lecturerId)
        {
            return Task.FromResult(context.Sections
                .Include(s => s.CurriculumCourse)
                .Where(s => s.Lecturer.Id == lecturerId)
                .AsEnumerable());
        }

        
    }
}