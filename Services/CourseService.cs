using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
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

            // With this line:
            AcademicProgram program = context.Programs.Find(courseRequest.ProgramId) ?? throw new Exception("Program not found");
            CurriculumCourse curriculum = new CurriculumCourse
            {
                Course = newCourse,
                SemeterSuggested = courseRequest.SemesterSuggested,
                isRequired = false,
                Program = program
            };

            context.CurriculumCourses.Add(curriculum);
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

        public async Task<PagedResult<CourseWithProgramListResponse>> GetCoursesWithProgramsAsync(
            PaginationParams pagination, 
            string? search = null, 
            int? courseType = null)
        {
            var query = context.CurriculumCourses
                .Include(cc => cc.Course)
                .Include(cc => cc.Program)
                    .ThenInclude(p => p.Department)
                .AsQueryable();

            // Apply search filter - tìm kiếm trong mã môn và tên môn
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(cc => 
                    cc.Course.CourseCode.ToLower().Contains(searchTerm) ||
                    cc.Course.CourseName.ToLower().Contains(searchTerm));
            }

            // Apply course type filter (1: Bắt buộc, 0: Tự chọn)
            if (courseType.HasValue)
            {
                bool isRequired = courseType.Value == 1;
                query = query.Where(cc => cc.isRequired == isRequired);
            }

            // Group by course to get distinct courses with their programs
            var courseGroups = await query
                .GroupBy(cc => new { 
                    cc.Course.CourseId, 
                    cc.Course.CourseCode, 
                    cc.Course.CourseName, 
                    cc.Course.CreditsTheory, 
                    cc.Course.CreditsLab 
                })
                .ToListAsync();

            // Get total count
            var totalCount = courseGroups.Count;

            // Apply pagination to course groups
            var pagedCourseGroups = courseGroups
                .OrderBy(g => g.Key.CourseCode)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            // Map to response DTOs
            var result = new List<CourseWithProgramListResponse>();

            foreach (var courseGroup in pagedCourseGroups)
            {
                var courseKey = courseGroup.Key;
                var curriculumCourses = courseGroup.ToList();

                // Get simple program list
                var programList = curriculumCourses
                    .Select(cc => new SimpleProgramResponse
                    {
                        ProgramId = cc.Program.AcademicProgramId,
                        ProgramName = cc.Program.ProgramName,
                        DepartmentName = cc.Program.Department.DepartmentName,
                        IsRequired = cc.isRequired,
                        SemesterSuggested = cc.SemeterSuggested
                    })
                    .ToList();

                var courseResponse = new CourseWithProgramListResponse
                {
                    CourseId = courseKey.CourseId,
                    CourseCode = courseKey.CourseCode,
                    CourseName = courseKey.CourseName,
                    CreditsTheory = courseKey.CreditsTheory,
                    CreditsLab = courseKey.CreditsLab,
                    TotalCredits = courseKey.CreditsTheory + courseKey.CreditsLab,
                    Programs = programList,
                    TotalPrograms = curriculumCourses.Count
                };

                result.Add(courseResponse);
            }

            return new PagedResult<CourseWithProgramListResponse>
            {
                Items = result,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }


    }
}