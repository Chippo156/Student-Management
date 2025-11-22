using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CreditStatisticsResponse> GetStudentCreditStatisticsAsync(int studentId)
        {
            // Lấy thông tin sinh viên
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                .FirstOrDefaultAsync(s => s.Id == studentId)
                ?? throw new Exception($"Student with ID {studentId} not found");

            // Lấy tất cả kết quả học tập của sinh viên
            var finalResults = await _context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                       .ThenInclude(s => s.Course)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.Id == studentId)
                .ToListAsync();

            // Lấy tất cả enrollment của sinh viên
            var enrollments = await _context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                      .ThenInclude(s => s.Course)
                .Include(e => e.Section.Semester)
                .Where(e => e.Student.Id == studentId)
                .ToListAsync();

            // Lấy thông tin GPA snapshot mới nhất
            var latestGpaSnapshot = await _context.GpaSnapshots
                .Where(g => g.Student.Id == studentId)
                .OrderByDescending(g => g.Semester.Year)
                .ThenByDescending(g => g.Semester.Term)
                .FirstOrDefaultAsync();

            // Tính toán thống kê tín chỉ
            int totalCreditsRegistered = enrollments.Sum(e => e.Section.CurriculumCourse.Course.CreditsTheory + e.Section.CurriculumCourse.Course.CreditsLab);
            int totalCreditsCompleted = finalResults.Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);
            
            // Tính tín chỉ đạt (điểm chữ từ D trở lên hoặc GradePoint >= 1.0)
            int totalCreditsPassed = finalResults
                .Where(fr => fr.GradePoint >= 1.0)
                .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);

            // Tạo response
            var response = new CreditStatisticsResponse
            {
                StudentId = student.Id,
                StudentName = student.User.FullName,
                MSSV = student.MSSV,
                ClassName = student.Class.ClassName,
                ProgramName = student.Class.Program.ProgramName,
                TotalCreditsRegistered = totalCreditsRegistered,
                TotalCreditsCompleted = totalCreditsCompleted,
                TotalCreditsPassed = totalCreditsPassed,
                GPA = latestGpaSnapshot?.Gpa ?? 0.0
            };

            // Thống kê theo học kỳ
            var semesters = enrollments
                .Select(e => e.Section.Semester)
                .Distinct()
                .OrderByDescending(s => s.Year)
                .ThenByDescending(s => s.Term)
                .ToList();

            foreach (var semester in semesters)
            {
                var semesterEnrollments = enrollments.Where(e => e.Section.Semester.SemesterId == semester.SemesterId).ToList();
                var semesterResults = finalResults.Where(fr => fr.Section.Semester.SemesterId == semester.SemesterId).ToList();

                var semesterGpa = await _context.GpaSnapshots
                    .FirstOrDefaultAsync(g => g.Student.Id == studentId && g.Semester.SemesterId == semester.SemesterId);

                var semesterDetail = new SemesterCreditDetail
                {
                    SemesterName = $"{semester.Year} - {semester.Term}",
                    Year = semester.Year,
                    Term = semester.Term,
                    CreditsRegistered = semesterEnrollments.Sum(e => e.Section.CurriculumCourse.Course.CreditsTheory + e.Section.CurriculumCourse.Course.CreditsLab),
                    CreditsCompleted = semesterResults.Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab),
                    CreditsPassed = semesterResults.Where(fr => fr.GradePoint >= 1.0).Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab),
                    SemesterGPA = semesterGpa?.Gpa ?? 0.0
                };

                // Thêm chi tiết về các khóa học trong học kỳ
                foreach (var result in semesterResults)
                {
                    semesterDetail.Courses.Add(new CourseDetail
                    {
                        CourseId = result.Section.CurriculumCourse.Course.CourseId,
                        CourseCode = result.Section.CurriculumCourse.Course.CourseCode,
                        CourseName = result.Section.CurriculumCourse.Course.CourseName,
                        CreditsTheory = result.Section.CurriculumCourse.Course.CreditsTheory,
                        CreditsLab = result.Section.CurriculumCourse.Course.CreditsLab,
                        GradeLetter = result.GradeLetter,
                        GradePoint = result.GradePoint
                    });
                }

                response.SemesterCredits.Add(semesterDetail);
            }

            return response;
        }

        public async Task<CreditStudentResponse> GetStudentCreditStatisticsByMSSVAsync(string mssv)
        {
            var student = await _context.Students
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with MSSV {mssv} not found");

            var finalResults = await _context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                      .ThenInclude(s => s.Course)
                .Where(fr => fr.Student.MSSV == mssv && fr.GradePoint >= 1.0)
                .ToListAsync();

            int totalCreditsCompleted = finalResults.Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);

            return new CreditStudentResponse
            {
                totalCreditRequired = student.Class.Program.CreditsRequired,
                totalCreditCompleted = totalCreditsCompleted
            };
        }

        public async Task<SemesterCreditDetail> GetStudentSemesterStatisticsAsync(string mssv, int semesterId)
        {
            // Kiểm tra sinh viên tồn tại
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with ID {mssv} not found");

            // Kiểm tra học kỳ tồn tại
            var semester = await _context.Semesters
                .FirstOrDefaultAsync(s => s.SemesterId == semesterId)
                ?? throw new Exception($"Semester with ID {semesterId} not found");

            // Lấy kết quả học tập trong học kỳ
            var semesterResults = await _context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                       .ThenInclude(s => s.Course)

                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv && fr.Section.Semester.SemesterId == semesterId)
                .ToListAsync();

            // Lấy đăng ký học trong học kỳ
            var semesterEnrollments = await _context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                      .ThenInclude(s => s.Course)
                .Include(e => e.Section.Semester)
                .Where(e => e.Student.MSSV == mssv && e.Section.Semester.SemesterId == semesterId)
                .ToListAsync();

            // Lấy GPA của học kỳ
            var semesterGpa = await _context.GpaSnapshots
                .FirstOrDefaultAsync(g => g.Student.MSSV == mssv && g.Semester.SemesterId == semesterId);

            // Tạo response
            var semesterDetail = new SemesterCreditDetail
            {
                SemesterName = $"{semester.Year} - {semester.Term}",
                Year = semester.Year,
                Term = semester.Term,
                CreditsRegistered = semesterEnrollments.Sum(e => e.Section.CurriculumCourse.Course.CreditsTheory + e.Section.CurriculumCourse.Course.CreditsLab),
                CreditsCompleted = semesterResults.Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab),
                CreditsPassed = semesterResults.Where(fr => fr.GradePoint >= 1.0).Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab),
                SemesterGPA = Math.Round(semesterGpa?.Gpa ?? 0.0, 2)
            };

            // Tính điểm trung bình lớp cho từng khóa học và thêm chi tiết về các khóa học
            foreach (var result in semesterResults)
            {
                // Lấy tất cả điểm của lớp học phần (section) này
                var sectionResults = await _context.FinalResults
                    .Where(fr => fr.Section.SectionId == result.Section.SectionId)
                    .ToListAsync();

                // Tính điểm trung bình lớp
                double classAverageScore = 0;
                if (sectionResults.Count > 0)
                {
                    classAverageScore = sectionResults.Average(fr => fr.FinalScore);
                }

                semesterDetail.Courses.Add(new CourseDetail
                {
                    CourseId = result.Section.CurriculumCourse.Course.CourseId,
                    CourseCode = result.Section.CurriculumCourse.Course.CourseCode,
                    CourseName = result.Section.CurriculumCourse.Course.CourseName,
                    CreditsTheory = result.Section.CurriculumCourse.Course.CreditsTheory,
                    CreditsLab = result.Section.CurriculumCourse.Course.CreditsLab,
                    GradeLetter = result.GradeLetter,
                    GradePoint = Math.Round(result.FinalScore, 2),
                    
                    ClassAverageScore = Math.Round(classAverageScore, 2) // Làm tròn đến 2 chữ số thập phân
                });
            }

            return semesterDetail;
        }

        public async Task<StudentAcademicSummaryResponse> GetStudentAcademicSummaryAsync(string mssv, int semesterId)
        {
            // Find the student
            var student = await _context.Students
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with MSSV {mssv} not found");

            var response = new StudentAcademicSummaryResponse();
            
            // Get final results
            IQueryable<FinalResult> finalResultsQuery = _context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv);
            
            // If specific semester is requested, filter results
            if (semesterId != 0)
            {
                finalResultsQuery = finalResultsQuery.Where(fr => fr.Section.Semester.SemesterId == semesterId);
            }
            
            var finalResults = await finalResultsQuery.ToListAsync();
            
            // Get GPA snapshots
            IQueryable<GpaSnapshot> gpaQuery = _context.GpaSnapshots
                .Include(g => g.Semester)
                .Where(g => g.Student.MSSV == mssv);
                
            if (semesterId != 0)
            {
                gpaQuery = gpaQuery.Where(g => g.Semester.SemesterId == semesterId);
            }
            
            var gpaSnapshots = await gpaQuery.ToListAsync();
            
            // Calculate completed and failed credits
            int completedCredits = finalResults
                .Where(fr => fr.GradePoint >= 1.0) // Passing grade
                .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);
                
            int failedCredits = finalResults
                .Where(fr => fr.GradePoint < 1.0) // Failed grade
                .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);
            
            // Get required credits for the program
            int requiredCredits = student.Class.Program.CreditsRequired;
            
            // If looking at all semesters, use cumulative GPA from latest snapshot
            if (semesterId == 0)
            {
                double totalGpa = 0;
                foreach (var result in gpaSnapshots)
                {
                    var GPA = result.Gpa;
                    totalGpa += GPA;
                }
                response.GPA = gpaSnapshots.Count > 0 ? Math.Round((totalGpa / gpaSnapshots.Count) * 2.5, 2) : 0.0;
                // Add per-semester summaries
                var semesters = finalResults
                    .Select(fr => fr.Section.Semester)
                    .Distinct()
                    .OrderByDescending(s => s.Year)
                    .ThenByDescending(s => s.Term)
                    .ToList();
                    
                foreach (var semester in semesters)
                {
                    var semesterResults = finalResults
                        .Where(fr => fr.Section.Semester.SemesterId == semester.SemesterId)
                        .ToList();
                        
                    var semesterGpa = gpaSnapshots
                        .FirstOrDefault(g => g.Semester.SemesterId == semester.SemesterId);
                        
                    var semesterSummary = new SemesterSummary
                    {
                        SemesterId = semester.SemesterId,
                        SemesterName = $"{semester.Year} {semester.Term}",
                        SemesterGPA = semesterGpa?.Gpa ?? 0.0,
                        CompletedCredits = semesterResults
                            .Where(fr => fr.GradePoint >= 1.0)
                            .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab),
                        FailedCredits = semesterResults
                            .Where(fr => fr.GradePoint < 1.0)
                            .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab)
                    };
                    
                    response.SemesterSummaries.Add(semesterSummary);
                }
            }
            else
            {
                // For a specific semester, use semester GPA
                var semesterGpa = gpaSnapshots.FirstOrDefault();
                response.GPA = semesterGpa?.Gpa ?? 0.0;
            }
            
            // Set other fields in response
            response.CompletedCredits = completedCredits;
            response.FailedCredits = failedCredits;
            response.CompletionRate = requiredCredits > 0 
                ? Math.Round((double)completedCredits / requiredCredits * 100, 2) 
                : 0;
            
            // Add failed courses
            response.FailedCourses = finalResults
                .Where(fr => fr.GradePoint < 1.0)
                .Select(fr => new FailedCourseInfo
                {
                    CourseCode = fr.Section.CurriculumCourse.Course.CourseCode,
                    CourseName = fr.Section.CurriculumCourse.Course.CourseName,
                    Credits = fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab,
                    GradeLetter = fr.GradeLetter,
                    FinalScore = fr.FinalScore
                })
                .ToList();
            
            return response;
        }

        public async Task<StatisticsOverviewResponse> GetStatisticsOverviewAsync()
        {
            // Đếm tổng số sinh viên
            var totalStudents = await _context.Students.CountAsync();

            // Đếm tổng số giảng viên
            var totalLecturers = await _context.Lecturers.CountAsync();

            // Đếm tổng số môn học
            var totalCourses = await _context.Courses.CountAsync();

            // Tính tỷ lệ sinh viên qua môn
            double passingRate = 0.0;
            
            // Lấy tất cả final results
            var allFinalResults = await _context.FinalResults.ToListAsync();
            
            if (allFinalResults.Any())
            {
                // Đếm số kết quả đậu (GradePoint >= 1.0)
                var passedResults = allFinalResults.Count(fr => fr.GradePoint >= 1.0);
                
                // Tính tỷ lệ phần trăm
                passingRate = Math.Round((double)passedResults / allFinalResults.Count * 100, 2);
            }

            return new StatisticsOverviewResponse
            {
                TotalStudents = totalStudents,
                TotalLecturers = totalLecturers,
                TotalCourses = totalCourses,
                PassingRate = passingRate
            };
        }

        public async Task<StudentStatusStatisticsResponse> GetStudentStatusStatisticsAsync()
        {
            // Đếm theo từng trạng thái
            var activeCount = await _context.Students
                .CountAsync(s => s.StudentStatus == StudentStatus.Active);

            var inactiveCount = await _context.Students
                .CountAsync(s => s.StudentStatus == StudentStatus.Inactive);

            var graduatedCount = await _context.Students
                .CountAsync(s => s.StudentStatus == StudentStatus.Graduated);

            var suspendedCount = await _context.Students
                .CountAsync(s => s.StudentStatus == StudentStatus.Suspended);

            var reservedCount = await _context.Students
                .CountAsync(s => s.StudentStatus == StudentStatus.Reserved);

            var totalCount = activeCount + inactiveCount + graduatedCount + suspendedCount + reservedCount;

            return new StudentStatusStatisticsResponse
            {
                ActiveStudents = activeCount,
                InactiveStudents = inactiveCount,
                GraduatedStudents = graduatedCount,
                SuspendedStudents = suspendedCount,
                ReservedStudents = reservedCount,
                TotalStudents = totalCount
            };
        }

        public async Task<SimpleYearlyGrowthResponse> GetSimpleYearlyGrowthAsync(int years = 5)
        {
            var currentYear = DateTime.Now.Year;
            var startYear = currentYear - years + 1;

            // Lấy sinh viên theo năm
            var studentCounts = await _context.Students
                .Where(s => 
                           s.YearOfAdmission >= startYear && 
                           s.YearOfAdmission <= currentYear)
                .GroupBy(s => s.YearOfAdmission)
                .Select(g => new { Year = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Year, x => x.Count);

            // Lấy giảng viên theo năm
            var lecturerCounts = await _context.Lecturers
                .Include(l => l.User)
                .Where(l => l.User.CreatedAt.Year >= startYear && 
                           l.User.CreatedAt.Year <= currentYear)
                .GroupBy(l => l.User.CreatedAt.Year)
                .Select(g => new { Year = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Year, x => x.Count);

            var yearlyData = new List<SimpleYearlyData>();

            for (int year = startYear; year <= currentYear; year++)
            {
                yearlyData.Add(new SimpleYearlyData
                {
                    Year = year,
                    StudentCount = studentCounts.GetValueOrDefault(year, 0),
                    LecturerCount = lecturerCounts.GetValueOrDefault(year, 0)
                });
            }

            return new SimpleYearlyGrowthResponse
            {
                Years = years,
                Data = yearlyData,
                TotalStudents = yearlyData.Sum(x => x.StudentCount),
                TotalLecturers = yearlyData.Sum(x => x.LecturerCount)
            };
        }

        public async Task<StudentGradeStatisticsResponse> GetStudentGradeStatisticsAsync(string mssv)
        {
            // Lấy thông tin sinh viên
            var student = await _context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with MSSV {mssv} not found");

            // Lấy tất cả final results
            var finalResults = await _context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv)
                .ToListAsync();

            // Lấy GPA snapshots
            var gpaSnapshots = await _context.GpaSnapshots
                .Include(g => g.Semester)
                .Where(g => g.Student.MSSV == mssv)
                .OrderBy(g => g.Semester.Year)
                .ThenBy(g => g.Semester.Term)
                .ToListAsync();

            // Tính toán overall statistics
            var overallStats = CalculateOverallStats(finalResults);
            
            // Thống kê phân bố điểm chữ
            var gradeDistribution = CalculateGradeDistribution(finalResults);
            
            // Thống kê theo học kỳ
            var semesterStats = CalculateSemesterStats(finalResults, gpaSnapshots);
            
            // Thống kê theo loại môn học (có thể mở rộng later)
            var subjectTypeStats = CalculateSubjectTypeStats(finalResults);
            
            // Performance trend
            var performanceTrend = CalculatePerformanceTrend(gpaSnapshots);

            return new StudentGradeStatisticsResponse
            {
                MSSV = student.MSSV,
                StudentName = student.User.FullName,
                ClassName = student.Class.ClassName,
                ProgramName = student.Class.Program.ProgramName,
                OverallStats = overallStats,
                GradeDistribution = gradeDistribution,
                SemesterStats = semesterStats,
                SubjectTypeStats = subjectTypeStats,
                PerformanceTrend = performanceTrend
            };
        }

        public async Task<AllStudentsGradeStatisticsResponse> GetAllStudentsGradeStatisticsAsync(int? departmentId = null, int? semesterId = null)
        {
            // Base query cho final results
            var query = _context.FinalResults
                .Include(fr => fr.Student)
                    .ThenInclude(s => s.User)
                .Include(fr => fr.Student)
                    .ThenInclude(s => s.Class)
                        .ThenInclude(c => c.Program)
                            .ThenInclude(p => p.Department)
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(fr => fr.Section.Semester)
                .AsQueryable();

            // Apply filters
            if (departmentId.HasValue)
            {
                query = query.Where(fr => fr.Student.Class.Program.Department.DepartmentId == departmentId.Value);
            }

            if (semesterId.HasValue)
            {
                query = query.Where(fr => fr.Section.Semester.SemesterId == semesterId.Value);
            }

            var allResults = await query.ToListAsync();

            // Overall statistics
            var overallStats = new OverallGradeStats
            {
                TotalStudents = allResults.Select(r => r.Student.Id).Distinct().Count(),
                StudentsWithGrades = allResults.Select(r => r.Student.Id).Distinct().Count(),
                SystemWideGPA = Math.Round(allResults.Average(r => r.GradePoint), 2),
                AverageScore = Math.Round(allResults.Average(r => r.FinalScore), 2),
                OverallPassingRate = Math.Round((double)allResults.Count(r => r.GradePoint >= 1.0) / allResults.Count * 100, 2),
                TotalSubjects = allResults.Count,
                TotalPassedSubjects = allResults.Count(r => r.GradePoint >= 1.0),
                TotalFailedSubjects = allResults.Count(r => r.GradePoint < 1.0)
            };

            // Grade distribution
            var gradeDistribution = CalculateSystemGradeDistribution(allResults);

            // Department statistics
            var departmentStats = allResults
                .GroupBy(r => r.Student.Class.Program.Department)
                .Select(g => new DepartmentGradeStat
                {
                    DepartmentId = g.Key.DepartmentId,
                    DepartmentName = g.Key.DepartmentName,
                    StudentsCount = g.Select(r => r.Student.Id).Distinct().Count(),
                    AverageGPA = Math.Round(g.Average(r => r.GradePoint), 2),
                    PassingRate = Math.Round((double)g.Count(r => r.GradePoint >= 1.0) / g.Count() * 100, 2),
                    TotalSubjects = g.Count()
                })
                .OrderByDescending(d => d.AverageGPA)
                .ToList();

            // Program statistics
            var programStats = allResults
                .GroupBy(r => r.Student.Class.Program)
                .Select(g => new ProgramGradeStat
                {
                    ProgramId = g.Key.AcademicProgramId,
                    ProgramName = g.Key.ProgramName,
                    DepartmentName = g.Key.Department.DepartmentName,
                    StudentsCount = g.Select(r => r.Student.Id).Distinct().Count(),
                    AverageGPA = Math.Round(g.Average(r => r.GradePoint), 2),
                    PassingRate = Math.Round((double)g.Count(r => r.GradePoint >= 1.0) / g.Count() * 100, 2)
                })
                .OrderByDescending(p => p.AverageGPA)
                .ToList();

            // Semester statistics
            var semesterStats = allResults
                .GroupBy(r => r.Section.Semester)
                .Select(g => new SemesterOverallStat
                {
                    SemesterId = g.Key.SemesterId,
                    SemesterName = $"{g.Key.Year} - {g.Key.Term}",
                    StudentsCount = g.Select(r => r.Student.Id).Distinct().Count(),
                    AverageGPA = Math.Round(g.Average(r => r.GradePoint), 2),
                    PassingRate = Math.Round((double)g.Count(r => r.GradePoint >= 1.0) / g.Count() * 100, 2),
                    TotalSubjects = g.Count()
                })
                .OrderByDescending(s => s.SemesterName)
                .ToList();

            // Rankings

            return new AllStudentsGradeStatisticsResponse
            {
                OverallStats = overallStats,
                GradeDistribution = gradeDistribution,
                DepartmentStats = departmentStats,
                ProgramStats = programStats,
                SemesterStats = semesterStats,
            };
        }

        public async Task<GraduationYearlyStatisticsResponse> GetGraduationYearlyStatisticsAsync(int? startYear = null, int? endYear = null)
        {
            const double STANDARD_DURATION_YEARS = 4.5; // 4 năm rưởi

            // Xác định khoảng thời gian phân tích
            var currentYear = DateTime.Now.Year;
            startYear ??= currentYear - 5; // 5 năm gần đây
            endYear ??= currentYear;

            var yearlyStats = new List<YearlyGraduationStat>();

            for (int year = startYear.Value; year <= endYear.Value; year++)
            {
                // Tính năm nhập học dự kiến cho sinh viên ra trường năm này
                var expectedAdmissionYear = year - (int)Math.Ceiling(STANDARD_DURATION_YEARS);

                // Lấy sinh viên nhập học vào năm dự kiến
                var studentsInYear = await _context.Students
                    .Where(s => s.YearOfAdmission == expectedAdmissionYear)
                    .ToListAsync();

                if (!studentsInYear.Any())
                {
                    // Nếu không có sinh viên nào trong năm này, thêm record với 0
                    yearlyStats.Add(new YearlyGraduationStat
                    {
                        Year = year,
                        OnTimeGraduates = 0,
                        LateGraduates = 0
                    });
                    continue;
                }

                // Tính thời gian tốt nghiệp chuẩn (4.5 năm sau khi nhập học)
                var standardGraduationDate = DateOnly.FromDateTime(
                    new DateTime(expectedAdmissionYear + (int)Math.Ceiling(STANDARD_DURATION_YEARS), 8, 31)
                );

                int onTimeCount = 0;
                int lateCount = 0;

                foreach (var student in studentsInYear)
                {
                    if (student.StudentStatus == StudentStatus.Graduated)
                    {
                        // Sử dụng GraduationDate thực tế thay vì ước tính
                        if (student.GraduationDate != default(DateOnly))
                        {
                            // Kiểm tra tốt nghiệp có đúng hạn không
                            // Cho phép trễ tối đa 6 tháng (180 ngày)
                            var allowedLateDate = standardGraduationDate.AddDays(180);

                            if (student.GraduationDate <= standardGraduationDate)
                            {
                                onTimeCount++;
                            }
                            else if (student.GraduationDate <= allowedLateDate)
                            {
                                lateCount++;
                            }
                            // Nếu tốt nghiệp quá trễ (> 6 tháng) thì không tính vào thống kê năm này
                        }
                        else
                        {
                            // Nếu không có GraduationDate cụ thể, dùng logic cũ
                            // Giả định tốt nghiệp trong năm hiện tại
                            var assumedGraduationDate = DateOnly.FromDateTime(new DateTime(year, 6, 30));

                            if (assumedGraduationDate <= standardGraduationDate.AddDays(180))
                            {
                                onTimeCount++;
                            }
                            else
                            {
                                lateCount++;
                            }
                        }
                    }
                    else if (student.StudentStatus == StudentStatus.Active)
                    {
                        // Sinh viên vẫn đang học nhưng đã quá thời hạn chuẩn + 6 tháng
                        var currentDate = DateOnly.FromDateTime(DateTime.Now);
                        if (currentDate > standardGraduationDate.AddDays(180))
                        {
                            lateCount++; // Coi như trễ hạn vì vẫn chưa tốt nghiệp
                        }
                        // Nếu chưa quá hạn thì không tính vào thống kê năm này
                    }
                    // Các trạng thái khác (Dropped, Suspended, Inactive, Reserved) không tính vào thống kê tốt nghiệp
                }

                yearlyStats.Add(new YearlyGraduationStat
                {
                    Year = year,
                    OnTimeGraduates = onTimeCount,
                    LateGraduates = lateCount
                });
            }

            return new GraduationYearlyStatisticsResponse
            {
                YearlyStats = yearlyStats.OrderBy(y => y.Year).ToList()
            };
        }

        // Helper methods
        private GradeOverallStats CalculateOverallStats(List<FinalResult> finalResults)
        {
            if (!finalResults.Any())
            {
                return new GradeOverallStats();
            }

            var passedResults = finalResults.Where(r => r.GradePoint >= 1.0).ToList();
            var failedResults = finalResults.Where(r => r.GradePoint < 1.0).ToList();

            var highest = finalResults.OrderByDescending(r => r.FinalScore).First();
            var lowest = finalResults.OrderBy(r => r.FinalScore).First();

            return new GradeOverallStats
            {
                TotalSubjects = finalResults.Count,
                PassedSubjects = passedResults.Count,
                FailedSubjects = failedResults.Count,
                PassingRate = Math.Round((double)passedResults.Count / finalResults.Count * 100, 2),
                AverageScore = Math.Round(finalResults.Average(r => r.FinalScore), 2),
                CurrentGPA4 = Math.Round(finalResults.Average(r => r.GradePoint), 2),
                CurrentGPA10 = Math.Round(finalResults.Average(r => r.GradePoint) * 2.5, 2),
                HighestScore = highest.FinalScore,
                LowestScore = lowest.FinalScore,
                HighestScoreSubject = highest.Section.CurriculumCourse.Course.CourseName,
                LowestScoreSubject = lowest.Section.CurriculumCourse.Course.CourseName,
                TotalCreditsRegistered = finalResults.Sum(r => r.Section.CurriculumCourse.Course.CreditsTheory + r.Section.CurriculumCourse.Course.CreditsLab),
                TotalCreditsEarned = passedResults.Sum(r => r.Section.CurriculumCourse.Course.CreditsTheory + r.Section.CurriculumCourse.Course.CreditsLab),
                TotalCreditsFailed = failedResults.Sum(r => r.Section.CurriculumCourse.Course.CreditsTheory + r.Section.CurriculumCourse.Course.CreditsLab)
            };
        }

        private List<GradeLetterStat> CalculateGradeDistribution(List<FinalResult> finalResults)
        {
            var gradeGroups = finalResults
                .GroupBy(r => r.GradeLetter)
                .ToDictionary(g => g.Key, g => g.Count());

            var gradeLetters = new[] { "A", "B+", "B", "C+", "C", "D+", "D", "F" };
            var gradeDescriptions = new Dictionary<string, string>
            {
                { "A", "Xuất sắc" },
                { "B+", "Giỏi" },
                { "B", "Khá" },
                { "C+", "Khá" },
                { "C", "Trung bình" },
                { "D+", "Trung bình" },
                { "D", "Yếu" },
                { "F", "Kém" }
            };

            return gradeLetters.Select(grade => new GradeLetterStat
            {
                GradeLetter = grade,
                Count = gradeGroups.GetValueOrDefault(grade, 0),
                Percentage = finalResults.Count > 0 ? 
                    Math.Round((double)gradeGroups.GetValueOrDefault(grade, 0) / finalResults.Count * 100, 2) : 0,
                Description = gradeDescriptions.GetValueOrDefault(grade, "")
            }).ToList();
        }

        private List<SemesterGradeStat> CalculateSemesterStats(List<FinalResult> finalResults, List<GpaSnapshot> gpaSnapshots)
        {
            return finalResults
                .GroupBy(r => r.Section.Semester)
                .Select(g =>
                {
                    var semester = g.Key;
                    var results = g.ToList();
                    var passedCount = results.Count(r => r.GradePoint >= 1.0);
                    
                    var semesterGpa = gpaSnapshots
                        .FirstOrDefault(gpa => gpa.Semester.SemesterId == semester.SemesterId);

                    return new SemesterGradeStat
                    {
                        SemesterId = semester.SemesterId,
                        SemesterName = $"{semester.Year} - {semester.Term}",
                        Year = semester.Year,
                        Term = semester.Term,
                        SubjectsCount = results.Count,
                        PassedCount = passedCount,
                        FailedCount = results.Count - passedCount,
                        SemesterGPA4 = Math.Round(semesterGpa?.Gpa ?? 0, 2),
                        SemesterGPA10 = Math.Round((semesterGpa?.Gpa ?? 0) * 2.5, 2),
                        AverageScore = Math.Round(results.Average(r => r.FinalScore), 2),
                        PassingRate = Math.Round((double)passedCount / results.Count * 100, 2),
                        CreditsRegistered = results.Sum(r => r.Section.CurriculumCourse.Course.CreditsTheory + r.Section.CurriculumCourse.Course.CreditsLab),
                        CreditsEarned = results.Where(r => r.GradePoint >= 1.0).Sum(r => r.Section.CurriculumCourse.Course.CreditsTheory + r.Section.CurriculumCourse.Course.CreditsLab),
                        AcademicRank = GetAcademicRank(semesterGpa?.Gpa ?? 0)
                    };
                })
                .OrderByDescending(s => s.Year)
                .ThenByDescending(s => s.Term)
                .ToList();
        }

        private List<SubjectTypeStat> CalculateSubjectTypeStats(List<FinalResult> finalResults)
        {
            // Simplified subject type classification - có thể mở rộng dựa trên course properties
            return new List<SubjectTypeStat>
            {
                new SubjectTypeStat
                {
                    SubjectType = "Tất cả môn học",
                    SubjectsCount = finalResults.Count,
                    AverageScore = finalResults.Count > 0 ? Math.Round(finalResults.Average(r => r.FinalScore), 2) : 0,
                    PassingRate = finalResults.Count > 0 ? Math.Round((double)finalResults.Count(r => r.GradePoint >= 1.0) / finalResults.Count * 100, 2) : 0,
                    TotalCredits = finalResults.Sum(r => r.Section.CurriculumCourse.Course.CreditsTheory + r.Section.CurriculumCourse.Course.CreditsLab)
                }
            };
        }

        private GradePerformanceTrend CalculatePerformanceTrend(List<GpaSnapshot> gpaSnapshots)
        {
            if (gpaSnapshots.Count < 2)
            {
                return new GradePerformanceTrend
                {
                    TrendDirection = "Stable",
                    TrendDescription = "Chưa đủ dữ liệu để đánh giá xu hướng",
                    TrendPoints = gpaSnapshots.Select(g => new SemesterTrendPoint
                    {
                        SemesterName = $"{g.Semester.Year}-{g.Semester.Term}",
                        GPA = Math.Round(g.Gpa, 2),
                        AverageScore = Math.Round(g.Gpa * 2.5, 2)
                    }).ToList()
                };
            }

            var firstGpa = gpaSnapshots.First().Gpa;
            var lastGpa = gpaSnapshots.Last().Gpa;
            var changeFromFirst = lastGpa - firstGpa;
            var changeFromPrevious = gpaSnapshots.Count > 1 ? lastGpa - gpaSnapshots[gpaSnapshots.Count - 2].Gpa : 0;

            string direction;
            string description;

            if (Math.Abs(changeFromFirst) < 0.1)
            {
                direction = "Stable";
                description = "Kết quả học tập ổn định qua các học kỳ";
            }
            else if (changeFromFirst > 0)
            {
                direction = "Improving";
                description = $"Kết quả học tập có xu hướng cải thiện (tăng {changeFromFirst:F2} điểm GPA)";
            }
            else
            {
                direction = "Declining";
                description = $"Kết quả học tập có xu hướng giảm sút (giảm {Math.Abs(changeFromFirst):F2} điểm GPA)";
            }

            return new GradePerformanceTrend
            {
                TrendDirection = direction,
                TrendDescription = description,
                GPAChangeFromFirstSemester = Math.Round(changeFromFirst, 2),
                GPAChangeFromLastSemester = Math.Round(changeFromPrevious, 2),
                TrendPoints = gpaSnapshots.Select(g => new SemesterTrendPoint
                {
                    SemesterName = $"{g.Semester.Year}-{g.Semester.Term}",
                    GPA = Math.Round(g.Gpa, 2),
                    AverageScore = Math.Round(g.Gpa * 2.5, 2)
                }).ToList()
            };
        }

        private List<GradeLetterDistribution> CalculateSystemGradeDistribution(List<FinalResult> allResults)
        {
            return CalculateGradeDistribution(allResults)
                .Select(g => new GradeLetterDistribution
                {
                    GradeLetter = g.GradeLetter,
                    Count = g.Count,
                    Percentage = g.Percentage,
                    Description = g.Description
                }).ToList();
        }

        private string GetAcademicRank(double gpa)
        {
            return gpa switch
            {
                >= 3.6 => "Xuất sắc",
                >= 3.2 => "Giỏi", 
                >= 2.5 => "Khá",
                >= 2.0 => "Trung bình",
                >= 1.0 => "Yếu",
                _ => "Kém"
            };
        }
    }
}