using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
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
                throw new Exception("Không tìm thấy chuyên ngành nào");
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
                throw new Exception("Không tìm thấy chuyên ngành nào");
            }

            program.ProgramName = request.ProgramName;
            program.DegreeLevel = request.DegreeLevel;
            program.Department = department;

            context.Programs.Update(program);
            await context.SaveChangesAsync();
            return program;
        }

        public async Task<ProgramCurriculumResponse> GetProgramCurriculumAsync(int programId, string? mssv = null)
        {
            // Get program information
            var program = await context.Programs
                .Include(p => p.Department)
                    .ThenInclude(d => d.Faculty)
                .FirstOrDefaultAsync(p => p.AcademicProgramId == programId)
                ?? throw new Exception($"Chương trình với ID {programId} không tìm thấy");

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

            // **NEW: Get student progress if MSSV is provided**
            Dictionary<int, StudentCourseProgress>? studentProgress = null;
            if (!string.IsNullOrEmpty(mssv))
            {
                studentProgress = await GetStudentProgressAsync(mssv, courseIds);
            }

            // Create the main response object
            var response = new ProgramCurriculumResponse
            {
                ProgramId = program.AcademicProgramId,
                ProgramName = program.ProgramName,
                DegreeLevel = program.DegreeLevel,
                TotalCreditsRequired = program.CreditsRequired,
                DepartmentName = program.Department.DepartmentName,
                FacultyName = program.Department.Faculty.FacultyName,
                StudentMSSV = mssv
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

                // **NEW: Get student progress for this course**
                var progress = studentProgress?.GetValueOrDefault(curriculumCourse.Course.CourseId);

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
                    Prerequisites = coursePrerequisites,
                    
                    // **NEW: Student progress information**
                    StudentProgress = progress
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

            // **NEW: Calculate student completion statistics**
            if (studentProgress != null)
            {
                var completedRequiredCredits = courseDetails
                    .Where(c => c.IsRequired && c.StudentProgress?.IsCompleted == true)
                    .Sum(c => c.TotalCredits);
                    
                var completedOptionalCredits = courseDetails
                    .Where(c => !c.IsRequired && c.StudentProgress?.IsCompleted == true)
                    .Sum(c => c.TotalCredits);

                response.StudentCompletedRequiredCredits = completedRequiredCredits;
                response.StudentCompletedOptionalCredits = completedOptionalCredits;
                response.StudentTotalCompletedCredits = completedRequiredCredits + completedOptionalCredits;
                response.StudentCompletionRate = Math.Round((double)response.StudentTotalCompletedCredits / response.TotalCreditsRequired * 100, 2);
                
                response.StudentCompletedRequiredCourses = courseDetails.Count(c => c.IsRequired && c.StudentProgress?.IsCompleted == true);
                response.StudentCompletedOptionalCourses = courseDetails.Count(c => !c.IsRequired && c.StudentProgress?.IsCompleted == true);
            }

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
                    Courses = semesterCourses.OrderBy(c => c.CourseCode).ToList(),
                    
                    // **NEW: Student progress for semester**
                    StudentCompletedCredits = studentProgress != null ? 
                        semesterCourses.Where(c => c.StudentProgress?.IsCompleted == true).Sum(c => c.TotalCredits) : 0,
                    StudentCompletedCourses = studentProgress != null ?
                        semesterCourses.Count(c => c.StudentProgress?.IsCompleted == true) : 0
                };

                response.SemesterCourses.Add(semesterDetail);
            }

            return response;
        }

        // **NEW: Helper method to get student progress**
        private async Task<Dictionary<int, StudentCourseProgress>> GetStudentProgressAsync(string mssv, List<int> courseIds)
        {
            var progressDict = new Dictionary<int, StudentCourseProgress>();

            // Get student's final results
            var finalResults = await context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv && 
                            courseIds.Contains(fr.Section.CurriculumCourse.Course.CourseId))
                .ToListAsync();

            // Get student's current enrollments
            var currentEnrollments = await context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(e => e.Section.Semester)
                .Where(e => e.Student.MSSV == mssv && 
                        courseIds.Contains(e.Section.CurriculumCourse.Course.CourseId) &&
                        e.enrollmentStatus == EnrollmentStatus.Enrolled)
                .ToListAsync();

            // Process final results
            foreach (var result in finalResults)
            {
                var courseId = result.Section.CurriculumCourse.Course.CourseId;
                var credits = result.Section.CurriculumCourse.Course.CreditsTheory + 
                            result.Section.CurriculumCourse.Course.CreditsLab;

                if (!progressDict.ContainsKey(courseId))
                {
                    progressDict[courseId] = new StudentCourseProgress
                    {
                        CourseId = courseId,
                        HasTaken = true,
                        IsCompleted = result.GradePoint >= 1.0, // D trở lên là đạt
                        FinalScore = result.FinalScore,
                        GradeLetter = result.GradeLetter,
                        GradePoint = result.GradePoint,
                        SemesterTaken = $"{result.Section.Semester.Year} - {result.Section.Semester.Term}",
                        Status = result.GradePoint >= 1.0 ? "Đã đạt" : "Chưa đạt",
                        CreditsEarned = result.GradePoint >= 1.0 ? credits : 0,
                        AttemptCount = 1,
                        CanRetake = result.GradePoint < 1.0,
                        CanImprove = result.GradePoint >= 1.0 && result.GradePoint < 3.0
                    };
                }
                else
                {
                    // Nếu đã có record (sinh viên học lại), cập nhật với kết quả tốt nhất
                    var existing = progressDict[courseId];
                    existing.AttemptCount++;
                    
                    if (result.GradePoint > existing.GradePoint)
                    {
                        existing.IsCompleted = result.GradePoint >= 1.0;
                        existing.FinalScore = result.FinalScore;
                        existing.GradeLetter = result.GradeLetter;
                        existing.GradePoint = result.GradePoint;
                        existing.SemesterTaken = $"{result.Section.Semester.Year} - {result.Section.Semester.Term}";
                        existing.Status = result.GradePoint >= 1.0 ? "Đã đạt" : "Chưa đạt";
                        existing.CreditsEarned = result.GradePoint >= 1.0 ? credits : 0;
                    }
                    
                    existing.CanRetake = existing.GradePoint < 1.0;
                    existing.CanImprove = existing.GradePoint >= 1.0 && existing.GradePoint < 3.0;
                }
            }

            // Process current enrollments (for courses without final results yet)
            foreach (var enrollment in currentEnrollments)
            {
                var courseId = enrollment.Section.CurriculumCourse.Course.CourseId;
                
                if (!progressDict.ContainsKey(courseId))
                {
                    progressDict[courseId] = new StudentCourseProgress
                    {
                        CourseId = courseId,
                        HasTaken = true,
                        IsCompleted = false,
                        Status = "Đang học",
                        SemesterTaken = $"{enrollment.Section.Semester.Year} - {enrollment.Section.Semester.Term}",
                        AttemptCount = 1,
                        CreditsEarned = 0,
                        CanRetake = false,
                        CanImprove = false
                    };
                }
                else
                {
                    // Nếu đã có final result nhưng đang học lại
                    var existing = progressDict[courseId];
                    if (existing.Status != "Đang học")
                    {
                        existing.Status = $"{existing.Status} (Đang học lại)";
                        existing.SemesterTaken += $" | Đang học: {enrollment.Section.Semester.Year} - {enrollment.Section.Semester.Term}";
                    }
                }
            }

            // Add courses that haven't been taken yet
            foreach (var courseId in courseIds)
            {
                if (!progressDict.ContainsKey(courseId))
                {
                    progressDict[courseId] = new StudentCourseProgress
                    {
                        CourseId = courseId,
                        HasTaken = false,
                        IsCompleted = false,
                        Status = "Chưa học",
                        AttemptCount = 0,
                        CreditsEarned = 0,
                        CanRetake = false,
                        CanImprove = false
                    };
                }
            }

            return progressDict;
        }
    }
}