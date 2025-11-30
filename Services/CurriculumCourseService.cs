using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Update.Internal;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Linq;

namespace StudentManagement.Services
{
    public class CurriculumCourseService(AppDbContext context) : ICurriculumCourseService
    {
        public async Task<CurriculumCourse> CreateCurriculumCourseAsync(CurriculumCourseRequest request)
        {
            if (request.Course != null)
            {
                var existingCourse = await context.Courses
                    .FirstOrDefaultAsync(c => c.CourseCode == request.Course.CourseCode);
                if (existingCourse != null)
                {
                    request.CourseId = existingCourse.CourseId;
                }
                else
                {
                    var newCourse = new Course
                    {
                        CourseCode = request.Course.CourseCode,
                        CourseName = request.Course.CourseName,
                        CreditsTheory = request.Course.CreditsTheory,
                        CreditsLab = request.Course.CreditsLab
                    };
                    context.Courses.Add(newCourse);
                    await context.SaveChangesAsync();
                    request.CourseId = newCourse.CourseId;
                }
            }
            var program = await context.Programs.FindAsync(request.ProgramId)
                ?? throw new Exception("Program not found");
                
            var course = await context.Courses.FindAsync(request.CourseId)
                ?? throw new Exception("Course not found");

            var curriculumCourse = new CurriculumCourse
            {
                Program = program,
                Course = course,
                isRequired = request.IsRequired,
                SemeterSuggested = request.SemesterSuggested,
                CreatedAt = DateTime.Now
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
                  .Include(cc => cc.Program.Department)
                    .Include(cc => cc.Program.Department.Faculty)
                .Include(cc => cc.Course)
                .ToListAsync();
        }
        public async Task<PagedResult<CurriculumCourseResponse>> GetAllCurriculumCoursesWithPaginationAsync(
    PaginationParams pagination,
    string? searchCourseCode = null,
    string? searchCourseName = null,
    int? programId = null,
    int? departmentId = null)
        {
            var query = context.CurriculumCourses
                .Include(cc => cc.Program)
                    .ThenInclude(p => p.Department)
                        .ThenInclude(d => d.Faculty)
                .Include(cc => cc.Course)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(searchCourseCode))
            {
                query = query.Where(cc => cc.Course.CourseCode.Contains(searchCourseCode.Trim()));
            }

            if (!string.IsNullOrWhiteSpace(searchCourseName))
            {
                query = query.Where(cc => cc.Course.CourseName.Contains(searchCourseName.Trim()));
            }

            if (programId.HasValue)
            {
                query = query.Where(cc => cc.Program.AcademicProgramId == programId.Value);
            }

            if (departmentId.HasValue)
            {
                query = query.Where(cc => cc.Program.Department.DepartmentId == departmentId.Value);
            }

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination and ordering
            var curriculumCourses = await query
                .OrderByDescending(cc => cc.CreatedAt)
                .ThenBy(cc => cc.Program.ProgramName)
                .ThenBy(cc => cc.SemeterSuggested)
                .ThenBy(cc => cc.Course.CourseCode)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var curriculumCourseResponses = new List<CurriculumCourseResponse>();

            foreach (var cc in curriculumCourses)
            {
                // Get prerequisites for this course
                var prerequisites = await context.Prerequisites
                    .Include(p => p.PrerequisiteCourse)
                    .Where(p => p.CourseId == cc.Course.CourseId)
                    .Select(p => new PrerequisiteCourseInfo
                    {
                        CourseId = p.PrerequisiteCourse.CourseId,
                        CourseCode = p.PrerequisiteCourse.CourseCode,
                        CourseName = p.PrerequisiteCourse.CourseName,
                        TotalCredits = p.PrerequisiteCourse.CreditsTheory + p.PrerequisiteCourse.CreditsLab
                    })
                    .ToListAsync();

                curriculumCourseResponses.Add(new CurriculumCourseResponse
                {
                    CurriculumCourseId = cc.Id,
                    CourseId = cc.Course.CourseId,
                    CourseCode = cc.Course.CourseCode,
                    CourseName = cc.Course.CourseName,
                    CreditsTheory = cc.Course.CreditsTheory,
                    CreditsLab = cc.Course.CreditsLab,
                    TotalCredits = cc.Course.CreditsTheory + cc.Course.CreditsLab,
                    IsRequired = cc.isRequired,
                    SemesterSuggested = cc.SemeterSuggested,
                    CourseType = cc.isRequired ? "Bắt buộc" : "Tự chọn",

                    // Program information
                    ProgramId = cc.Program.AcademicProgramId,
                    ProgramName = cc.Program.ProgramName,
                    DegreeLevel = cc.Program.DegreeLevel,

                    // Department information
                    DepartmentId = cc.Program.Department.DepartmentId,
                    DepartmentName = cc.Program.Department.DepartmentName,
                    FacultyName = cc.Program.Department.Faculty.FacultyName,

                    // Prerequisites
                    Prerequisites = prerequisites
                });
            }

            return new PagedResult<CurriculumCourseResponse>
            {
                Items = curriculumCourseResponses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<PagedResult<CurriculumCourseResponse>> SearchCurriculumCoursesAsync(
            CurriculumCourseSearchRequest searchRequest)
        {
            var query = context.CurriculumCourses
                .Include(cc => cc.Program)
                    .ThenInclude(p => p.Department)
                        .ThenInclude(d => d.Faculty)
                .Include(cc => cc.Course)
                .AsQueryable();

            // Apply search filters
            if (!string.IsNullOrWhiteSpace(searchRequest.CourseCode))
            {
                query = query.Where(cc => cc.Course.CourseCode.Contains(searchRequest.CourseCode.Trim()));
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.CourseName))
            {
                query = query.Where(cc => cc.Course.CourseName.Contains(searchRequest.CourseName.Trim()));
            }

            if (searchRequest.ProgramId.HasValue)
            {
                query = query.Where(cc => cc.Program.AcademicProgramId == searchRequest.ProgramId.Value);
            }

            if (searchRequest.DepartmentId.HasValue)
            {
                query = query.Where(cc => cc.Program.Department.DepartmentId == searchRequest.DepartmentId.Value);
            }

            if (searchRequest.SemesterSuggested.HasValue)
            {
                query = query.Where(cc => cc.SemeterSuggested == searchRequest.SemesterSuggested.Value);
            }

            if (searchRequest.IsRequired.HasValue)
            {
                query = query.Where(cc => cc.isRequired == searchRequest.IsRequired.Value);
            }

            if (searchRequest.MinCredits.HasValue)
            {
                query = query.Where(cc => (cc.Course.CreditsTheory + cc.Course.CreditsLab) >= searchRequest.MinCredits.Value);
            }

            if (searchRequest.MaxCredits.HasValue)
            {
                query = query.Where(cc => (cc.Course.CreditsTheory + cc.Course.CreditsLab) <= searchRequest.MaxCredits.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = searchRequest.SortBy?.ToLower() switch
            {
                "coursecode" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(cc => cc.Course.CourseCode)
                    : query.OrderBy(cc => cc.Course.CourseCode),
                "coursename" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(cc => cc.Course.CourseName)
                    : query.OrderBy(cc => cc.Course.CourseName),
                "credits" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(cc => cc.Course.CreditsTheory + cc.Course.CreditsLab)
                    : query.OrderBy(cc => cc.Course.CreditsTheory + cc.Course.CreditsLab),
                "semester" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(cc => cc.SemeterSuggested)
                    : query.OrderBy(cc => cc.SemeterSuggested),
                _ => query.OrderBy(cc => cc.Program.Department.DepartmentName)
                    .ThenBy(cc => cc.Program.ProgramName)
                    .ThenBy(cc => cc.SemeterSuggested)
                    .ThenBy(cc => cc.Course.CourseCode)
            };

            // Apply pagination
            var curriculumCourses = await query
                .Skip((searchRequest.PageNumber - 1) * searchRequest.PageSize)
                .Take(searchRequest.PageSize)
                .ToListAsync();

            // Map to response (same logic as above)
            var responses = await MapToCurriculumCourseResponsesAsync(curriculumCourses);

            return new PagedResult<CurriculumCourseResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = searchRequest.PageNumber,
                PageSize = searchRequest.PageSize
            };
        }

        private async Task<List<CurriculumCourseResponse>> MapToCurriculumCourseResponsesAsync(List<CurriculumCourse> curriculumCourses)
        {
            var responses = new List<CurriculumCourseResponse>();

            foreach (var cc in curriculumCourses)
            {
                var prerequisites = await context.Prerequisites
                    .Include(p => p.PrerequisiteCourse)
                    .Where(p => p.CourseId == cc.Course.CourseId)
                    .Select(p => new PrerequisiteCourseInfo
                    {
                        CourseId = p.PrerequisiteCourse.CourseId,
                        CourseCode = p.PrerequisiteCourse.CourseCode,
                        CourseName = p.PrerequisiteCourse.CourseName,
                        TotalCredits = p.PrerequisiteCourse.CreditsTheory + p.PrerequisiteCourse.CreditsLab
                    })
                    .ToListAsync();

                responses.Add(new CurriculumCourseResponse
                {
                    CurriculumCourseId = cc.Id,
                    CourseId = cc.Course.CourseId,
                    CourseCode = cc.Course.CourseCode,
                    CourseName = cc.Course.CourseName,
                    CreditsTheory = cc.Course.CreditsTheory,
                    CreditsLab = cc.Course.CreditsLab,
                    TotalCredits = cc.Course.CreditsTheory + cc.Course.CreditsLab,
                    IsRequired = cc.isRequired,
                    SemesterSuggested = cc.SemeterSuggested,
                    CourseType = cc.isRequired ? "Bắt buộc" : "Tự chọn",
                    ProgramId = cc.Program.AcademicProgramId,
                    ProgramName = cc.Program.ProgramName,
                    DegreeLevel = cc.Program.DegreeLevel,
                    DepartmentId = cc.Program.Department.DepartmentId,
                    DepartmentName = cc.Program.Department.DepartmentName,
                    FacultyName = cc.Program.Department.Faculty.FacultyName,
                    Prerequisites = prerequisites
                });
            }

            return responses;
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
            curriculumCourse.UpdatedAt = DateTime.Now;

            context.CurriculumCourses.Update(curriculumCourse);
            await context.SaveChangesAsync();
            return curriculumCourse;
        }

        public async Task<IEnumerable<CourseByStudentDepartmentResponse>> GetCoursesByStudentDepartmentAsync(string mssv, int? semesterId = null, CourseFilterType? filterType = null)
        {
            // Get student information with program and department
            var student = await context.Students
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                            .ThenInclude(d => d.Faculty)
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with MSSV {mssv} not found");

            var programId = student.Class.Program.AcademicProgramId;

            // Get all curriculum courses for the student's program
            var curriculumCoursesQuery = context.CurriculumCourses
                .Include(cc => cc.Course)
                .Include(cc => cc.Program)
                    .ThenInclude(p => p.Department)
                        .ThenInclude(d => d.Faculty)
                .Where(cc => cc.Program.AcademicProgramId == programId);

            // Filter by semester if specified
            if (semesterId.HasValue)
            {
                var semester = await context.Semesters.FindAsync(semesterId.Value)
                    ?? throw new Exception($"Semester with ID {semesterId.Value} not found");

                var today = DateOnly.FromDateTime(DateTime.Now);

                //// Nếu học kỳ đó chưa bắt đầu (tương lai)
                //if (today < semester.StartDate)
                //{
                //    // Future semester - chưa có môn học khả dụng
                //    return new List<CourseByStudentDepartmentResponse>();
                //}

                // Nếu học kỳ đó đã kết thúc (quá hạn)
                if (today > semester.EndDate)
                {
                    // Semester has ended - không lấy môn đã kết thúc
                    return new List<CourseByStudentDepartmentResponse>();
                }

                // Học kỳ hiện tại -> tiếp tục xử lý bình thường
            }

            var curriculumCourses = await curriculumCoursesQuery.ToListAsync();

            // Get student's enrollment history
            var studentEnrollments = await context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(e => e.Section.Semester)

                .Where(e => e.Student.MSSV == mssv)
                .ToListAsync();

            // Get student's final results
            var studentFinalResults = await context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Where(fr => fr.Student.MSSV == mssv)
                .ToListAsync();

            // Get all prerequisites for these courses
            var courseIds = curriculumCourses.Select(cc => cc.Course.CourseId).ToList();
            var prerequisites = await context.Prerequisites
                .Include(p => p.Course)
                .Include(p => p.PrerequisiteCourse)
                .Where(p => courseIds.Contains(p.CourseId))
                .ToListAsync();

            // Create the response
            var response = new List<CourseByStudentDepartmentResponse>();

            foreach (var curriculumCourse in curriculumCourses)
            {
                var course = curriculumCourse.Course;
                var program = curriculumCourse.Program;

                // Check student's history with this course
                var hasEnrolled = studentEnrollments.Any(e => e.Section.CurriculumCourse.Course.CourseId == course.CourseId);
                var finalResult = studentFinalResults.FirstOrDefault(fr => fr.Section.CurriculumCourse.Course.CourseId == course.CourseId);
                var hasPassed = finalResult != null && finalResult.GradePoint >= 1.0;
                var hasFailed = finalResult != null && finalResult.GradePoint < 1.0;

                // Determine course status
                CourseFilterType courseStatus;
                if (!hasEnrolled)
                {
                    courseStatus = CourseFilterType.New;
                }
                else if (hasFailed)
                {
                    var hasEnrolledInCurrentSemester = studentEnrollments.Any(e => e.Section.CurriculumCourse.Course.CourseId == course.CourseId && e.Section.Semester.SemesterId == semesterId);
                    if (hasEnrolledInCurrentSemester)
                    {
                        // Skip courses already enrolled in current semester
                        continue;
                    }
                    courseStatus = CourseFilterType.Retake;
                }
                else if (hasPassed)
                {
                    courseStatus = CourseFilterType.Improvement;
                }
                else
                {
                    // Enrolled but no final result yet - treat as new for filtering purposes
                    continue;

                }


                // Apply filter if specified
                if (filterType.HasValue && courseStatus != filterType.Value)
                {
                    continue;
                }

                // Get prerequisites for this course
                var coursePrerequisites = prerequisites
                    .Where(p => p.CourseId == course.CourseId)
                    .Select(p => new PrerequisiteCourseInfo
                    {
                        CourseId = p.PrerequisiteCourse.CourseId,
                        CourseCode = p.PrerequisiteCourse.CourseCode,
                        CourseName = p.PrerequisiteCourse.CourseName,
                        TotalCredits = p.PrerequisiteCourse.CreditsTheory + p.PrerequisiteCourse.CreditsLab
                    })
                    .ToList();

                var courseResponse = new CourseByStudentDepartmentResponse
                {
                    CurriculumCourseId = curriculumCourse.Id,
                    CourseId = course.CourseId,
                    CourseCode = course.CourseCode,
                    CourseName = course.CourseName,
                    CreditsTheory = course.CreditsTheory,
                    CreditsLab = course.CreditsLab,
                    TotalCredits = course.CreditsTheory + course.CreditsLab,

                    // Department info
                    DepartmentName = program.Department.DepartmentName,
                    FacultyName = program.Department.Faculty.FacultyName,

                    // Curriculum Course info
                    IsRequired = curriculumCourse.isRequired,
                    SemesterSuggested = curriculumCourse.SemeterSuggested,
                    ProgramName = program.ProgramName,

                    // Course status
                    CourseStatus = courseStatus,
                    PreviousGradeLetter = finalResult?.GradeLetter,
                    PreviousFinalScore = finalResult?.FinalScore,
                    HasPreviousResult = finalResult != null,

                    // Prerequisites
                    Prerequisites = coursePrerequisites
                };

                response.Add(courseResponse);
            }

            // Sort by semester suggested, then by course code
            return response
                .OrderBy(c => c.SemesterSuggested)
                .ThenBy(c => c.CourseCode)
                .ToList();
        }
        //    public async Task<IEnumerable<CourseByStudentDepartmentResponse>> GetCoursesByStudentDepartmentAsync(string mssv, int? semesterId = null, CourseFilterType? filterType = null)
        //    {
        //        // Get student information with program and department
        //        var student = await context.Students
        //            .Include(s => s.Class)
        //                .ThenInclude(c => c.Program)
        //                    .ThenInclude(p => p.Department)
        //                        .ThenInclude(d => d.Faculty)
        //            .FirstOrDefaultAsync(s => s.MSSV == mssv)
        //            ?? throw new Exception($"Student with MSSV {mssv} not found");

        //        var programId = student.Class.Program.AcademicProgramId;
        //        var departmentId = student.Class.Program.Department.DepartmentId;

        //        // Determine which semester to check for registration
        //        int targetSemesterId;
        //        if (semesterId.HasValue && semesterId.Value != 0)
        //        {
        //            targetSemesterId = semesterId.Value;
        //        }
        //        else
        //        {
        //            // Get current semester based on registration period
        //           var currentRegistrationPeriod = context.RegistrationPeriods
        //.Include(rp => rp.Semester)
        //.Include(rp => rp.Department)
        //.AsEnumerable() // ← tải hết từ DB trước, rồi lọc trong bộ nhớ
        //.FirstOrDefault(rp =>
        //    rp.Department.DepartmentId == departmentId &&
        //    rp.IsActive);


        //            if (currentRegistrationPeriod == null)
        //            {
        //                // No active registration period found
        //                return new List<CourseByStudentDepartmentResponse>();
        //            }

        //            targetSemesterId = currentRegistrationPeriod.Semester.SemesterId;
        //        }

        //        // Get all curriculum courses for the student's program
        //        var curriculumCoursesQuery = context.CurriculumCourses
        //            .Include(cc => cc.Course)
        //            .Include(cc => cc.Program)
        //                .ThenInclude(p => p.Department)
        //                    .ThenInclude(d => d.Faculty)
        //            .Where(cc => cc.Program.AcademicProgramId == programId);

        //        var curriculumCourses = await curriculumCoursesQuery.ToListAsync();

        //        // Get available sections for the target semester
        //        var availableSections = await context.Sections
        //            .Include(s => s.CurriculumCourse)
        //                .ThenInclude(cc => cc.Course)
        //            .Include(s => s.Semester)
        //            .Where(s => s.Semester.SemesterId == targetSemesterId)
        //            .ToListAsync();

        //        // Only include courses that have available sections in the target semester
        //        var coursesWithSections = curriculumCourses
        //            .Where(cc => availableSections.Any(s => s.CurriculumCourse.Course.CourseId == cc.Course.CourseId))
        //            .ToList();

        //        // Get student's enrollment history
        //        var studentEnrollments = await context.Enrollments
        //            .Include(e => e.Section)
        //                .ThenInclude(s => s.CurriculumCourse)
        //                    .ThenInclude(cc => cc.Course)
        //            .Where(e => e.Student.MSSV == mssv)
        //            .ToListAsync();

        //        // Get student's final results
        //        var studentFinalResults = await context.FinalResults
        //            .Include(fr => fr.Section)
        //                .ThenInclude(s => s.CurriculumCourse)
        //                    .ThenInclude(cc => cc.Course)
        //            .Where(fr => fr.Student.MSSV == mssv)
        //            .ToListAsync();

        //        // Check if student is already enrolled in target semester
        //        var currentSemesterEnrollments = await context.Enrollments
        //            .Include(e => e.Section)
        //                .ThenInclude(s => s.CurriculumCourse)
        //                    .ThenInclude(cc => cc.Course)
        //            .Where(e => e.Student.MSSV == mssv &&
        //                       e.Section.Semester.SemesterId == targetSemesterId &&
        //                       e.enrollmentStatus == EnrollmentStatus.Enrolled)
        //            .ToListAsync();

        //        // Get all prerequisites for these courses
        //        var courseIds = coursesWithSections.Select(cc => cc.Course.CourseId).ToList();
        //        var prerequisites = await context.Prerequisites
        //            .Include(p => p.Course)
        //            .Include(p => p.PrerequisiteCourse)
        //            .Where(p => courseIds.Contains(p.CourseId))
        //            .ToListAsync();

        //        // Create the response
        //        var response = new List<CourseByStudentDepartmentResponse>();

        //        foreach (var curriculumCourse in coursesWithSections)
        //        {
        //            var course = curriculumCourse.Course;
        //            var program = curriculumCourse.Program;

        //            // Check if student is already enrolled in this course for target semester
        //            var isAlreadyEnrolledThisSemester = currentSemesterEnrollments
        //                .Any(e => e.Section.CurriculumCourse.Course.CourseId == course.CourseId);

        //            if (isAlreadyEnrolledThisSemester)
        //            {
        //                // Skip courses already enrolled in current semester

        //                continue;
        //            }

        //            // Check student's history with this course
        //            var hasEnrolled = studentEnrollments.Any(e => e.Section.CurriculumCourse.Course.CourseId == course.CourseId);
        //            var finalResult = studentFinalResults.FirstOrDefault(fr => fr.Section.CurriculumCourse.Course.CourseId == course.CourseId);
        //            var hasPassed = finalResult != null && finalResult.GradePoint >= 1.0;
        //            var hasFailed = finalResult != null && finalResult.GradePoint < 1.0;

        //            // Determine course status
        //            CourseFilterType courseStatus;
        //            if (!hasEnrolled)
        //            {
        //                courseStatus = CourseFilterType.New;
        //            }
        //            else if (hasFailed)
        //            {
        //                courseStatus = CourseFilterType.Retake;
        //            }
        //            else if (hasPassed)
        //            {
        //                courseStatus = CourseFilterType.Improvement;
        //            }
        //            else
        //            {
        //                // Enrolled but no final result yet - skip for now
        //                continue;
        //            }

        //            // Apply filter if specified
        //            if (filterType.HasValue && courseStatus != filterType.Value)
        //            {
        //                continue;
        //            }

        //            // Check prerequisites are met
        //            var coursePrerequisites = prerequisites
        //                .Where(p => p.CourseId == course.CourseId)
        //                .ToList();

        //            bool prerequisitesMet = true;
        //            var prerequisiteInfo = new List<PrerequisiteCourseInfo>();

        //            foreach (var prerequisite in coursePrerequisites)
        //            {
        //                var hasCompletedPrerequisite = studentFinalResults
        //                    .Any(fr => fr.Section.CurriculumCourse.Course.CourseId == prerequisite.PrerequisiteCourseId &&
        //                              fr.GradePoint >= 1.0);

        //                if (!hasCompletedPrerequisite)
        //                {
        //                    prerequisitesMet = false;
        //                }

        //                prerequisiteInfo.Add(new PrerequisiteCourseInfo
        //                {
        //                    CourseId = prerequisite.PrerequisiteCourse.CourseId,
        //                    CourseCode = prerequisite.PrerequisiteCourse.CourseCode,
        //                    CourseName = prerequisite.PrerequisiteCourse.CourseName,
        //                    TotalCredits = prerequisite.PrerequisiteCourse.CreditsTheory + prerequisite.PrerequisiteCourse.CreditsLab,
        //                    IsCompleted = hasCompletedPrerequisite
        //                });
        //            }

        //            // Get available sections count for this course in target semester
        //            var availableSectionsCount = availableSections
        //                .Count(s => s.CurriculumCourse.Course.CourseId == course.CourseId);

        //            var courseResponse = new CourseByStudentDepartmentResponse
        //            {
        //                CurriculumCourseId = curriculumCourse.Id,
        //                CourseId = course.CourseId,
        //                CourseCode = course.CourseCode,
        //                CourseName = course.CourseName,
        //                CreditsTheory = course.CreditsTheory,
        //                CreditsLab = course.CreditsLab,
        //                TotalCredits = course.CreditsTheory + course.CreditsLab,

        //                // Department info
        //                DepartmentName = program.Department.DepartmentName,
        //                FacultyName = program.Department.Faculty.FacultyName,

        //                // Curriculum Course info
        //                IsRequired = curriculumCourse.isRequired,
        //                SemesterSuggested = curriculumCourse.SemeterSuggested,
        //                ProgramName = program.ProgramName,

        //                // Course status
        //                CourseStatus = courseStatus,
        //                PreviousGradeLetter = finalResult?.GradeLetter,
        //                PreviousFinalScore = finalResult?.FinalScore,
        //                HasPreviousResult = finalResult != null,

        //                // Prerequisites
        //                Prerequisites = prerequisiteInfo,

        //                // Registration info
        //                CanRegister = prerequisitesMet,
        //                AvailableSectionsCount = availableSectionsCount,
        //                RegistrationNote = !prerequisitesMet ? "Không đáp ứng được điều kiện tiên quyết" :
        //                                 availableSectionsCount == 0 ? "Không có lớp học phần có sẵn" : ""
        //            };

        //            response.Add(courseResponse);
        //        }

        //        // Sort by semester suggested, then by course code
        //        return response
        //            .OrderBy(c => c.SemesterSuggested)
        //            .ThenBy(c => c.CourseCode)
        //            .ToList();
        //    }

    }
}