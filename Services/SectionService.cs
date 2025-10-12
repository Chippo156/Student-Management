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
            var course = await context.Courses.FindAsync(request.CourseId);
            if (course is null)
            {
                throw new Exception("Course not found");
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
                Course = course,
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
                .Include(s => s.Course)
                .Include(s => s.Lecturer)
                .Include(s => s.Semester)
                .ToListAsync();
        }

        public async Task<Section?> GetSectionByIdAsync(int sectionId)
        {
            return await context.Sections
                .Include(s => s.Course)
                .Include(s => s.Lecturer)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);
        }

        public async Task<IEnumerable<Section>> GetSectionsByCourseAsync(int courseId)
        {
            return await context.Sections
                .Include(s => s.Course)
                .Include(s => s.Lecturer)
                .Where(s => s.Course.CourseId == courseId)
                .ToListAsync();
        }

        public Task<IEnumerable<Section>> GetSectionsByLecturerAsync(int lecturerId)
        {
            return Task.FromResult(context.Sections
                .Include(s => s.Course)
                .Where(s => s.Lecturer.Id == lecturerId)
                .AsEnumerable());
        }

        
    }
}