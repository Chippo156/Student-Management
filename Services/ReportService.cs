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
    }
}