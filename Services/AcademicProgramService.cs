using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AcademicProgramService(AppDbContext context) : IAcademicProgramService
    {
        public async Task<AcademicProgram> CreateProgramAsync(AcademicProgramRequest request)
        {
            var department = await context.Departments.FindAsync(request.DepartmentId);
            if (department is null)
            {
                throw new Exception("Department not found");
            }

            var program = new AcademicProgram
            {
                ProgramName = request.ProgramName,
                DegreeLevel = request.DegreeLevel,
                Department = department,
                CreditsRequired = request.CreditsRequired
            };

            context.Programs.Add(program);
            await context.SaveChangesAsync();
            return program;
        }

        public async Task<bool> DeleteProgramAsync(int programId)
        {
            var program = await context.Programs.FindAsync(programId);
            if (program is null)
            {
                return false;
            }

            context.Programs.Remove(program);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<AcademicProgram>> GetAllProgramsAsync()
        {
            return await context.Programs
                .Include(p => p.Department)
                .ToListAsync();
        }

        public async Task<PagedResult<AcademicProgramResponse>> GetAllProgramsWithPaginationAsync(
            PaginationParams pagination,
            string? searchProgramName = null,
            int? departmentId = null,
            string? degreeLevel = null)
        {
            var query = context.Programs
                .Include(p => p.Department)
                    .ThenInclude(d => d.Faculty)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(searchProgramName))
            {
                query = query.Where(p => p.ProgramName.Contains(searchProgramName.Trim()));
            }

            if (departmentId.HasValue)
            {
                query = query.Where(p => p.Department.DepartmentId == departmentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(degreeLevel))
            {
                query = query.Where(p => p.DegreeLevel.Contains(degreeLevel.Trim()));
            }

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination and ordering
            var academicPrograms = await query
                .OrderBy(p => p.Department.DepartmentName)
                .ThenBy(p => p.DegreeLevel)
                .ThenBy(p => p.ProgramName)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var programResponses = academicPrograms.Select(p => new AcademicProgramResponse
            {
                AcademicProgramId = p.AcademicProgramId,
                ProgramName = p.ProgramName,
                DegreeLevel = p.DegreeLevel,
                CreditsRequired = p.CreditsRequired,

                // Department information
                DepartmentId = p.Department.DepartmentId,
                DepartmentName = p.Department.DepartmentName,
                FacultyId = p.Department.Faculty.FacultyId,
                FacultyName = p.Department.Faculty.FacultyName,

                // Statistics (you can add more if needed)
                CreatedAt = DateTime.Now, // Add if you have this field in AcademicProgram model
                IsActive = true // Add if you have this field in AcademicProgram model
            }).ToList();

            return new PagedResult<AcademicProgramResponse>
            {
                Items = programResponses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<AcademicProgram?> GetProgramByIdAsync(int programId)
        {
            return await context.Programs
                .Include(p => p.Department)
                .FirstOrDefaultAsync(p => p.AcademicProgramId == programId);
        }

        public async Task<IEnumerable<AcademicProgram>> GetProgramsByDepartmentAsync(int departmentId)
        {
            return await context.Programs
                .Include(p => p.Department)
                .Where(p => p.Department.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<AcademicProgram?> UpdateProgramAsync(int programId, AcademicProgramRequest request)
        {
            var program = await context.Programs.FindAsync(programId);
            if (program is null)
            {
                return null;
            }

            var department = await context.Departments.FindAsync(request.DepartmentId);
            if (department is null)
            {
                throw new Exception("Department not found");
            }

            program.ProgramName = request.ProgramName;
            program.DegreeLevel = request.DegreeLevel;
            program.Department = department;

            context.Programs.Update(program);
            await context.SaveChangesAsync();
            return program;
        }

        public async Task<ProgramCurriculumResponse> GetProgramCurriculumAsync(int programId)
        {
            // Get program information
            var program = await context.Programs
                .Include(p => p.Department)
                    .ThenInclude(d => d.Faculty)
                .FirstOrDefaultAsync(p => p.AcademicProgramId == programId)
                ?? throw new Exception($"Program with ID {programId} not found");

            // Get all curriculum courses for this program
            var curriculumCourses = await context.CurriculumCourses
                .Include(cc => cc.Course)
                .Include(cc => cc.Program)
                .Where(cc => cc.Program.AcademicProgramId == programId)
                .OrderBy(cc => cc.SemeterSuggested)
                .ThenBy(cc => cc.Course.CourseCode)
                .ToListAsync();

            // Get prerequisites for all courses in this program
            var courseIds = curriculumCourses.Select(cc => cc.Course.CourseId).ToList();
            var prerequisites = await context.Prerequisites
                .Include(p => p.Course)
                .Include(p => p.PrerequisiteCourse)
                .Where(p => courseIds.Contains(p.CourseId))
                .ToListAsync();

            // Create the main response object
            var response = new ProgramCurriculumResponse
            {
                ProgramId = program.AcademicProgramId,
                ProgramName = program.ProgramName,
                DegreeLevel = program.DegreeLevel,
                TotalCreditsRequired = program.CreditsRequired,
                DepartmentName = program.Department.DepartmentName,
                FacultyName = program.Department.Faculty.FacultyName
            };

            // Process each curriculum course
            var courseDetails = new List<CurriculumCourseDetail>();
            
            foreach (var curriculumCourse in curriculumCourses)
            {
                // Get prerequisites for this course
                var coursePrerequisites = prerequisites
                    .Where(p => p.CourseId == curriculumCourse.Course.CourseId)
                    .Select(p => new PrerequisiteCourseInfo
                    {
                        CourseId = p.PrerequisiteCourse.CourseId,
                        CourseCode = p.PrerequisiteCourse.CourseCode,
                        CourseName = p.PrerequisiteCourse.CourseName,
                        TotalCredits = p.PrerequisiteCourse.CreditsTheory + p.PrerequisiteCourse.CreditsLab
                    })
                    .ToList();

                var courseDetail = new CurriculumCourseDetail
                {
                    CurriculumCourseId = curriculumCourse.Id,
                    CourseId = curriculumCourse.Course.CourseId,
                    CourseCode = curriculumCourse.Course.CourseCode,
                    CourseName = curriculumCourse.Course.CourseName,
                    CreditsTheory = curriculumCourse.Course.CreditsTheory,
                    CreditsLab = curriculumCourse.Course.CreditsLab,
                    TotalCredits = curriculumCourse.Course.CreditsTheory + curriculumCourse.Course.CreditsLab,
                    IsRequired = curriculumCourse.isRequired,
                    SemesterSuggested = curriculumCourse.SemeterSuggested,
                    Prerequisites = coursePrerequisites
                };

                courseDetails.Add(courseDetail);
            }

            // Calculate summary statistics
            response.TotalRequiredCredits = courseDetails
                .Where(c => c.IsRequired)
                .Sum(c => c.TotalCredits);
                
            response.TotalOptionalCredits = courseDetails
                .Where(c => !c.IsRequired)
                .Sum(c => c.TotalCredits);
                
            response.RequiredCourseCount = courseDetails.Count(c => c.IsRequired);
            response.OptionalCourseCount = courseDetails.Count(c => !c.IsRequired);

            // Group courses by type
            response.RequiredCourses = courseDetails
                .Where(c => c.IsRequired)
                .OrderBy(c => c.SemesterSuggested)
                .ThenBy(c => c.CourseCode)
                .ToList();
                
            response.OptionalCourses = courseDetails
                .Where(c => !c.IsRequired)
                .OrderBy(c => c.SemesterSuggested)
                .ThenBy(c => c.CourseCode)
                .ToList();

            // Group courses by semester
            var semesterGroups = courseDetails
                .GroupBy(c => c.SemesterSuggested)
                .OrderBy(g => g.Key);

            foreach (var semesterGroup in semesterGroups)
            {
                var semesterCourses = semesterGroup.ToList();
                
                var semesterDetail = new SemesterCurriculumDetail
                {
                    SemesterNumber = semesterGroup.Key,
                    SemesterName = $"Học kỳ {semesterGroup.Key}",
                    TotalCredits = semesterCourses.Sum(c => c.TotalCredits),
                    RequiredCredits = semesterCourses.Where(c => c.IsRequired).Sum(c => c.TotalCredits),
                    OptionalCredits = semesterCourses.Where(c => !c.IsRequired).Sum(c => c.TotalCredits),
                    Courses = semesterCourses.OrderBy(c => c.CourseCode).ToList()
                };

                response.SemesterCourses.Add(semesterDetail);
            }

            return response;
        }
    }
}