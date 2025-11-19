using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class GradeService(AppDbContext context) : IGradeService
    {

        public async Task<bool> DeleteGradeAsync(int gradeId)
        {
            var grade = await context.Grades.FindAsync(gradeId);
            if (grade is null)
            {
                return false;
            }

            context.Grades.Remove(grade);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Grade>> GetAllGradesAsync()
        {
            return await context.Grades
                .Include(g => g.Student)
                    .ThenInclude(s => s.User)
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.Section)
                .ToListAsync();
        }

        public async Task<Grade?> GetGradeByIdAsync(int gradeId)
        {
            return await context.Grades
                .Include(g => g.Student)
                    .ThenInclude(s => s.User)
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.Section)
                .FirstOrDefaultAsync(g => g.GradeId == gradeId);
        }

        public async Task<IEnumerable<Grade>> GetGradesByAssessmentAsync(int assessmentId)
        {
            return await context.Grades
                .Include(g => g.Student)
                    .ThenInclude(s => s.User)
                .Include(g => g.Assessment)
                .Where(g => g.Assessment.AssessmentId == assessmentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Grade>> GetGradesByStudentAsync(int studentId)
        {
            return await context.Grades
                .Include(g => g.Student)
                .Include(g => g.Assessment)
                .Where(g => g.Student.Id == studentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Grade>> GetGradesBySectionAndStudentAsync(int sectionId, int studentId)
        {
            return await context.Grades
                .Include(g => g.Student)
                .Include(g => g.Assessment)
                .Where(g => g.Student.Id == studentId && g.Assessment.Section.SectionId == sectionId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Grade>> GetGradesBySemeterAndStudentAsync(int semeter, int studentId)
        {
            return await context.Grades
                 .Include(g => g.Assessment)
                     .ThenInclude(a => a.Section)
                 .Where(g => g.Student.Id == studentId && g.Assessment.Section.Semester.SemesterId == semeter)
                 .ToListAsync();

        }
        public async Task<IEnumerable<StudentSectionGradesResponse>> GetStudentSemesterGradesBySectionsAsync(string mssv, int semesterId)
        {
            // Get all enrollments for this student in the specified semester
            var enrollments = await context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(e => e.Section.Lecturer)
                    .ThenInclude(l => l.User)
                .Include(e => e.Section.Semester)
                .Where(e => e.Student.MSSV == mssv && e.Section.Semester.SemesterId == semesterId)
                .ToListAsync();

            var response = new List<StudentSectionGradesResponse>();

            foreach (var enrollment in enrollments)
            {
                var section = enrollment.Section;

                // Get all assessments for this section
                var assessments = await context.Assessment
                    .Include(a => a.AssessmentType)
                    .Where(a => a.Section.SectionId == section.SectionId)
                    .ToListAsync();

                // Get all grades for this student in this section's assessments
                var grades = await context.Grades
                    .Include(g => g.Assessment)
                        .ThenInclude(a => a.AssessmentType)
                    .Where(g => g.Student.MSSV == mssv && g.Assessment.Section.SectionId == section.SectionId)
                    .ToListAsync();

                // Get final result for this section if available
                var finalResult = await context.FinalResults
                    .FirstOrDefaultAsync(fr => fr.Student.MSSV == mssv && fr.Section.SectionId == section.SectionId);

                var sectionGrades = new StudentSectionGradesResponse
                {
                    SectionId = section.SectionId,
                    CourseCode = section.CurriculumCourse.Course.CourseCode,
                    CourseName = section.CurriculumCourse.Course.CourseName,
                    Credits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,
                    FinalScore = Math.Round(finalResult?.FinalScore ?? 0, 2),
                    GradeLetter = finalResult?.GradeLetter
                };

                // Add all assessment grades
                foreach (var assessment in assessments)
                {
                    var grade = grades.FirstOrDefault(g => g.Assessment.AssessmentId == assessment.AssessmentId);

                    sectionGrades.Grades.Add(new AssessmentGradeDetail
                    {
                        AssessmentName = assessment.Title,
                        AssessmentType = assessment.AssessmentType?.Title ?? "Unknown",
                        Score = grade?.Score ?? 0, // If no grade, default to 0
                        Weight = assessment.Weight,
                        AssessmentId = assessment.AssessmentId
                    });
                }

                response.Add(sectionGrades);
            }

            return response;
        }

        public async Task<StudentAllGradesResponse> GetAllStudentGradesByMSSVAsync(string mssv)
        {
            // Get student information
            var student = await context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with MSSV {mssv} not found");

            // Get all grades for this student with related data
            var allGrades = await context.Grades
                .Include(g => g.Student)
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.AssessmentType)
                .Include(g => g.Assessment.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(g => g.Assessment.Section.Semester)
                .Where(g => g.Student.MSSV == mssv)
                .ToListAsync();

            // Get all final results for this student
            var finalResults = await context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv)
                .ToListAsync();

            // Get all enrollments for this student
            var enrollments = await context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Include(e => e.Section.Semester)
                .Where(e => e.Student.MSSV == mssv)
                .ToListAsync();

            // Get GPA snapshots
            var gpaSnapshots = await context.GpaSnapshots
                .Include(g => g.Semester)
                .Where(g => g.Student.MSSV == mssv)
                .ToListAsync();

            var response = new StudentAllGradesResponse
            {
                MSSV = student.MSSV,
                StudentName = student.User.FullName
            };

            // Group grades by semester
            var gradesBySemester = allGrades
                .GroupBy(g => g.Assessment.Section.Semester)
                .OrderByDescending(g => g.Key.Year)
                .ThenByDescending(g => g.Key.Term);

            // Calculate cumulative statistics
            int cumulativeCreditsRegistered = 0;
            int cumulativeCreditsEarned = 0;
            int cumulativeCreditsDebt = 0;

            double cumulativeGpaValue = await GetCurrentCumulativeGpaAsync(student.Id);

            foreach (var semesterGroup in gradesBySemester)
            {
                var semester = semesterGroup.Key;
                var semesterGrades = semesterGroup.ToList();

                // Get GPA for this semester
                var semesterGpa = gpaSnapshots
                    .FirstOrDefault(g => g.Semester.SemesterId == semester.SemesterId);

                // Get enrollments for this semester
                var semesterEnrollments = enrollments
                    .Where(e => e.Section.Semester.SemesterId == semester.SemesterId)
                    .ToList();

                // Get final results for this semester
                var semesterFinalResults = finalResults
                    .Where(fr => fr.Section.Semester.SemesterId == semester.SemesterId)
                    .ToList();

                // Calculate semester credit statistics
                int semesterCreditsRegistered = semesterEnrollments
                    .Sum(e => e.Section.CurriculumCourse.Course.CreditsTheory + e.Section.CurriculumCourse.Course.CreditsLab);

                int semesterCreditsEarned = semesterFinalResults
                    .Where(fr => fr.GradePoint >= 1.0)
                    .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);

                int semesterCreditsDebt = semesterFinalResults
                    .Where(fr => fr.GradePoint < 1.0)
                    .Sum(fr => fr.Section.CurriculumCourse.Course.CreditsTheory + fr.Section.CurriculumCourse.Course.CreditsLab);

                // Update cumulative totals
                cumulativeCreditsRegistered += semesterCreditsRegistered;
                cumulativeCreditsEarned += semesterCreditsEarned;
                cumulativeCreditsDebt += semesterCreditsDebt;

                // Get cumulative GPA from latest semester up to current
                var cumulativeGpa = gpaSnapshots
                    .Where(g => g.Semester.Year < semester.Year ||
                               (g.Semester.Year == semester.Year && string.Compare(g.Semester.Term, semester.Term) <= 0))
                    .OrderByDescending(g => g.Semester.Year)
                    .ThenByDescending(g => g.Semester.Term)
                    .FirstOrDefault();

                // Calculate academic rankings
                string semesterRank = GetAcademicRank(semesterGpa?.Gpa ?? 0.0);
                string cumulativeRank = GetAcademicRank(cumulativeGpa?.Gpa ?? 0.0);

                var semesterDetail = new SemesterGradesDetail
                {
                    SemesterId = semester.SemesterId,
                    SemesterName = $"{semester.Year} - {semester.Term}",
                    Year = semester.Year,
                    Term = semester.Term,
                    SemesterGPA4 = Math.Round(semesterGpa?.Gpa ?? 0.0, 2),
                    SemesterGPA10 = Math.Round((semesterGpa?.Gpa ?? 0.0) * 2.5, 2),
                    CumulativeGPA4 = Math.Round(cumulativeGpaValue, 2),
                    CumulativeGPA10 = Math.Round(cumulativeGpaValue * 2.5, 2),
                    TotalCreditsRegistered = cumulativeCreditsRegistered,
                    TotalCreditsEarned = cumulativeCreditsEarned,
                    TotalCreditsDebt = cumulativeCreditsDebt,
                    SemesterRank = semesterRank,
                    CumulativeRank = cumulativeRank
                };

                // Group all grades by section (course)
                var gradesBySection = semesterGrades
                    .GroupBy(g => g.Assessment.Section)
                    .OrderBy(g => g.Key.CurriculumCourse.Course.CourseCode);

                foreach (var sectionGroup in gradesBySection)
                {
                    var section = sectionGroup.Key;
                    var sectionGrades = sectionGroup.ToList();

                    // Get final result for this section
                    var finalResult = finalResults
                        .FirstOrDefault(fr => fr.Section.SectionId == section.SectionId);

                    var courseGradeDetail = new CourseGradesDetail
                    {
                        SectionId = section.SectionId,
                        CourseCode = section.CurriculumCourse.Course.CourseCode,
                        CourseName = section.CurriculumCourse.Course.CourseName,
                        Credits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,
                        FinalScore = Math.Round(finalResult?.FinalScore ?? 0, 2),
                        GradeLetter = finalResult?.GradeLetter
                    };

                    // Group grades by assessment type
                    var gradesByAssessmentType = sectionGrades
                        .GroupBy(g => g.Assessment.AssessmentType.AssessmentTypeId)
                        .OrderBy(g => g.Key);

                    foreach (var assessmentTypeGroup in gradesByAssessmentType)
                    {
                        var assessmentTypeId = assessmentTypeGroup.Key;
                        var assessmentGrades = assessmentTypeGroup.ToList();

                        if (assessmentTypeId == 1)
                        {
                            // For Assessment Type 1, create one entry with details array
                            var type1Grades = assessmentGrades.Select(g => new RegularPointsDetail
                            {
                                GradeId = g.GradeId,
                                AssessmentId = g.Assessment.AssessmentId,
                                AssessmentName = g.Assessment.Title,
                                Score = g.Score,
                            }).ToList();

                            var firstGrade = assessmentGrades.First();
                            courseGradeDetail.Assessments.Add(new CourseAssessmentGrade
                            {
                                AssessmentName = "Điểm thường kỳ",
                                AssessmentType = firstGrade.Assessment.AssessmentType.Title,
                                AssessmentTypeId = assessmentTypeId,
                                RegularPointsDetails = type1Grades
                            });
                        }
                        else
                        {
                            // For other assessment types, add individual entries
                            foreach (var grade in assessmentGrades)
                            {
                                courseGradeDetail.Assessments.Add(new CourseAssessmentGrade
                                {
                                    GradeId = grade.GradeId,
                                    AssessmentId = grade.Assessment.AssessmentId,
                                    AssessmentName = grade.Assessment.Title,
                                    AssessmentType = grade.Assessment.AssessmentType.Title,
                                    AssessmentTypeId = grade.Assessment.AssessmentType.AssessmentTypeId,
                                    Score = Math.Round(grade?.Score ?? 0, 2),
                                    RegularPointsDetails = null // No details for non-Type1 assessments
                                });
                            }
                        }
                    }

                    semesterDetail.CourseGrades.Add(courseGradeDetail);
                }

                response.SemesterGrades.Add(semesterDetail);
            }

            return response;
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
        public async Task<double> GetCurrentCumulativeGpaAsync(int studentId)
        {
            // Get all final results for this student
            var allGpaSnapshot = await context.GpaSnapshots

                .Where(fr => fr.Student.Id == studentId)
                .ToListAsync();

            // Calculate overall cumulative GPA
            double totalGpa = 0;

            foreach (var result in allGpaSnapshot)
            {
                var GPA = result.Gpa;
                totalGpa += GPA;
            }
            return allGpaSnapshot.Count > 0 ? totalGpa / allGpaSnapshot.Count : 0.0;

        }

        public async Task<Grade> CreateGradeAsync(GradeRequest request)
        {
            var student = await context.Students.FindAsync(request.StudentId)
                ?? throw new Exception("Student not found");

            var assessment = await context.Assessment
                .Include(a => a.AssessmentType)
                .Include(a => a.Section)
                  .ThenInclude(a=> a.Semester)
                .FirstOrDefaultAsync(a => a.AssessmentId == request.AssessmentId)
                ?? throw new Exception("Assessment not found");

            Grade grade = new Grade
            {
                Student = student,
                Assessment = assessment,
                Score = request.Score
            };

            context.Grades.Add(grade);
            await context.SaveChangesAsync();

            // Check if this is a final exam grade (assuming AssessmentTypeId = 3 for final exams)
            if (assessment.AssessmentType.AssessmentTypeId == 4)
            {
                await UpdateFinalResultAsync(student.Id, assessment.Section.SectionId);
                await UpdateGpaSnapshotAsync(student.Id, assessment.Section.Semester.SemesterId);
            }

            return grade;
        }

        public async Task<Grade?> UpdateGradeAsync(int gradeId, GradeRequest request)
        {
            var grade = await context.Grades
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.AssessmentType)
                .Include(g => g.Assessment.Section)
                  .ThenInclude(s => s.Semester)
                .Include(g => g.Student)
                .FirstOrDefaultAsync(g => g.GradeId == gradeId);

            if (grade is null)
            {
                return null;
            }

            bool isStudentChanged = false;
            bool isAssessmentChanged = false;

            if (request.StudentId != grade.Student.Id)
            {
                var student = await context.Students.FindAsync(request.StudentId);
                if (student is null)
                {
                    throw new Exception("Student not found");
                }
                grade.Student = student;
                isStudentChanged = true;
            }

            if (request.AssessmentId != grade.Assessment.AssessmentId)
            {
                var assessment = await context.Assessment
                    .Include(a => a.AssessmentType)
                    .Include(a => a.Section)
                    .FirstOrDefaultAsync(a => a.AssessmentId == request.AssessmentId);
                if (assessment is null)
                {
                    throw new Exception("Assessment not found");
                }
                grade.Assessment = assessment;
                isAssessmentChanged = true;
            }

            grade.Score = request.Score;

            context.Grades.Update(grade);
            await context.SaveChangesAsync();

            // Update final results and GPA if this is a final exam
            if (grade.Assessment.AssessmentType.AssessmentTypeId == 4)
            {
                await UpdateFinalResultAsync(grade.Student.Id, grade.Assessment.Section.SectionId);
                await UpdateGpaSnapshotAsync(grade.Student.Id, grade.Assessment.Section.Semester.SemesterId);

                // If student or assessment changed, also update the old records
                if (isStudentChanged || isAssessmentChanged)
                {
                    // You may need to track old values to update previous records
                }
            }

            return grade;
        }

        private async Task UpdateFinalResultAsync(int studentId, int sectionId)
        {
            // Get all grades for this student in this section
            var grades = await context.Grades
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.AssessmentType)
                .Where(g => g.Student.Id == studentId && g.Assessment.Section.SectionId == sectionId)
                .ToListAsync();

            if (!grades.Any())
                return;

            // Calculate final score based on weighted average
            double finalScore = 0;
            double totalWeight = 0;

            foreach (var gradeGroup in grades.GroupBy(g => g.Assessment.AssessmentType.AssessmentTypeId))
            {
                var assessmentTypeGrades = gradeGroup.ToList();
                var firstGrade = assessmentTypeGrades.First();

                if (gradeGroup.Key == 1 || gradeGroup.Key == 2) // Regular grades - take average
                {
                    var averageScore = assessmentTypeGrades.Average(g => g.Score);
                    finalScore += averageScore * firstGrade.Assessment.Weight / 100;
                    totalWeight += firstGrade.Assessment.Weight;
                }
                else // Other assessment types - take the grade directly
                {
                    foreach (var grade in assessmentTypeGrades)
                    {
                        finalScore += grade.Score * grade.Assessment.Weight / 100;
                        totalWeight += grade.Assessment.Weight;
                    }
                }
            }

            // Normalize if total weight is not 100%
            if (totalWeight > 0 && totalWeight != 100)
            {
                finalScore = (finalScore / totalWeight) * 100;
            }

            // Determine grade letter and grade point
            var (gradeLetter, gradePoint) = CalculateGradeLetterAndPoint(finalScore);

            // Update or create final result
            var existingResult = await context.FinalResults
                .FirstOrDefaultAsync(fr => fr.Student.Id == studentId && fr.Section.SectionId == sectionId);

            if (existingResult != null)
            {
                existingResult.FinalScore = finalScore;
                existingResult.GradeLetter = gradeLetter;
                existingResult.GradePoint = gradePoint;
                context.FinalResults.Update(existingResult);
            }
            else
            {
                var student = await context.Students.FindAsync(studentId);
                var section = await context.Sections.FindAsync(sectionId);

                var finalResult = new FinalResult
                {
                    Student = student,
                    Section = section,
                    FinalScore = finalScore,
                    GradeLetter = gradeLetter,
                    GradePoint = gradePoint
                };

                context.FinalResults.Add(finalResult);
            }

            await context.SaveChangesAsync();
        }

        private async Task UpdateGpaSnapshotAsync(int studentId, int semesterId)
        {
            // Get all final results for this student in this semester
            var semesterResults = await context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Where(fr => fr.Student.Id == studentId && fr.Section.Semester.SemesterId == semesterId)
                .ToListAsync();

            if (!semesterResults.Any())
                return;

            // Calculate semester GPA
            double totalPoints = 0;
            int totalCredits = 0;

            foreach (var result in semesterResults)
            {
                var credits = result.Section.CurriculumCourse.Course.CreditsTheory +
                             result.Section.CurriculumCourse.Course.CreditsLab;

                totalPoints += result.GradePoint * credits;
                totalCredits += credits;
            }

            double semesterGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

            // Update or create GPA snapshot
            var existingSnapshot = await context.GpaSnapshots
                .FirstOrDefaultAsync(g => g.Student.Id == studentId && g.Semester.SemesterId == semesterId);

            if (existingSnapshot != null)
            {
                existingSnapshot.Gpa = semesterGpa;
                context.GpaSnapshots.Update(existingSnapshot);
            }
            else
            {
                var student = await context.Students.FindAsync(studentId);
                var semester = await context.Semesters.FindAsync(semesterId);

                var gpaSnapshot = new GpaSnapshot
                {
                    Student = student,
                    Semester = semester,
                    Gpa = semesterGpa
                };

                context.GpaSnapshots.Add(gpaSnapshot);
            }

            await context.SaveChangesAsync();
        }

        public async Task<SectionAllStudentsGradesResponse> GetAllGradesByStudentAndSectionAsync(int sectionId)
        {
            // Kiểm tra section tồn tại
            var section = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Semester)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId)
                ?? throw new Exception($"Section with ID {sectionId} not found");

            // Lấy tất cả sinh viên đã đăng ký section này
            var enrolledStudents = await context.Enrollments
                .Include(e => e.Student)
                    .ThenInclude(s => s.User)
                .Where(e => e.Section.SectionId == sectionId &&
                           e.enrollmentStatus == EnrollmentStatus.Enrolled)
                .OrderBy(e => e.Student.MSSV)
                .ToListAsync();

            if (!enrolledStudents.Any())
            {
                throw new Exception("No students enrolled in this section");
            }

            // Lấy tất cả assessments của section này
            var allAssessments = await context.Assessment
                .Include(a => a.AssessmentType)
                .Where(a => a.Section.SectionId == sectionId)
                .OrderBy(a => a.AssessmentType.AssessmentTypeId)
                .ThenBy(a => a.Title)
                .ToListAsync();

            // Lấy tất cả grades của tất cả sinh viên trong section này
            var studentIds = enrolledStudents.Select(e => e.Student.Id).ToList();
            var allGrades = await context.Grades
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.AssessmentType)
                .Include(g => g.Student)
                .Where(g => studentIds.Contains(g.Student.Id) &&
                           g.Assessment.Section.SectionId == sectionId)
                .ToListAsync();

            // Lấy final results của tất cả sinh viên
            var finalResults = await context.FinalResults
                .Include(fr => fr.Student)
                .Where(fr => studentIds.Contains(fr.Student.Id) &&
                            fr.Section.SectionId == sectionId)
                .ToDictionaryAsync(fr => fr.Student.Id, fr => fr);

            // Tạo response
            var response = new SectionAllStudentsGradesResponse
            {
                SectionId = section.SectionId,
                SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                CourseCode = section.CurriculumCourse.Course.CourseCode,
                CourseName = section.CurriculumCourse.Course.CourseName,
                Credits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,

                SemesterId = section.Semester.SemesterId,
                SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",

                LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",

                TotalStudents = enrolledStudents.Count,
                TotalAssessments = allAssessments.Count
            };

            // Group assessments by assessment type để tạo cấu trúc dữ liệu
            var assessmentsByType = allAssessments
                .GroupBy(a => a.AssessmentType.AssessmentTypeId)
                .OrderBy(g => g.Key);

            var assessmentHeaders = new List<AssessmentHeaderInfo>();

            foreach (var assessmentTypeGroup in assessmentsByType)
            {
                var assessmentTypeId = assessmentTypeGroup.Key;
                var assessments = assessmentTypeGroup.ToList();

                if (assessmentTypeId == 1) // Assessment Type 1 - Điểm thường kỳ
                {
                    foreach (var assessment in assessments)
                    {
                        assessmentHeaders.Add(new AssessmentHeaderInfo
                        {
                            AssessmentId = assessment.AssessmentId,
                            AssessmentName = assessment.Title,
                            AssessmentType = assessment.AssessmentType.Title,
                            AssessmentTypeId = assessmentTypeId,
                            Weight = assessment.Weight,
                            IsRegularType = true
                        });
                    }
                }
                else // Các assessment types khác
                {
                    foreach (var assessment in assessments)
                    {
                        assessmentHeaders.Add(new AssessmentHeaderInfo
                        {
                            AssessmentId = assessment.AssessmentId,
                            AssessmentName = assessment.Title,
                            AssessmentType = assessment.AssessmentType.Title,
                            AssessmentTypeId = assessmentTypeId,
                            Weight = assessment.Weight,
                            IsRegularType = false
                        });
                    }
                }
            }

            response.AssessmentHeaders = assessmentHeaders;

            // Tạo dữ liệu cho từng sinh viên
            var studentGrades = new List<StudentGradesInSection>();

            foreach (var enrollment in enrolledStudents)
            {
                var student = enrollment.Student;

                // Lấy grades của sinh viên này
                var studentGradesList = allGrades
                    .Where(g => g.Student.Id == student.Id)
                    .ToList();

                // Lấy final result của sinh viên này
                finalResults.TryGetValue(student.Id, out var finalResult);

                var studentGradeData = new StudentGradesInSection
                {
                    StudentId = student.Id,
                    StudentName = student.User.FullName,
                    MSSV = student.MSSV,
                    FinalScore = finalResult != null ? Math.Round(finalResult.FinalScore, 2) : (double?)null,
                    GradeLetter = finalResult?.GradeLetter,
                    EnrollmentStatus = GetEnrollmentStatusInVietnamese(enrollment.enrollmentStatus)
                };

                // Tạo dictionary để lưu điểm theo assessment
                var gradesByAssessment = studentGradesList.ToDictionary(g => g.Assessment.AssessmentId, g => g);

                // Điền điểm cho từng assessment
                var assessmentGrades = new List<AssessmentGradeData>();
                foreach (var assessmentHeader in assessmentHeaders)
                {
                    if (gradesByAssessment.TryGetValue(assessmentHeader.AssessmentId, out var grade))
                    {
                        assessmentGrades.Add(new AssessmentGradeData
                        {
                            AssessmentId = assessmentHeader.AssessmentId,
                            GradeId = grade.GradeId,
                            Score = grade.Score,
                            HasGrade = true,
                            CanEdit = false 
                        });
                    }
                    else
                    {
                        assessmentGrades.Add(new AssessmentGradeData
                        {
                            AssessmentId = assessmentHeader.AssessmentId,
                            GradeId = null,
                            Score = null,
                            HasGrade = false,
                            CanEdit = true // Có thể nhập điểm mới
                        });
                    }
                }

                studentGradeData.AssessmentGrades = assessmentGrades;

                // Tính toán thống kê cho sinh viên này
                var completedAssessments = assessmentGrades.Count(ag => ag.HasGrade);
                studentGradeData.CompletedAssessments = completedAssessments;
                studentGradeData.PendingAssessments = allAssessments.Count - completedAssessments;
                studentGradeData.CompletionPercentage = allAssessments.Count > 0 ?
                    Math.Round((double)completedAssessments / allAssessments.Count * 100, 2) : 0;

                studentGrades.Add(studentGradeData);
            }

            response.StudentGrades = studentGrades;

            // Tính toán thống kê tổng quan của section
            var totalCompletedGrades = studentGrades.Sum(sg => sg.CompletedAssessments);
            var totalPossibleGrades = response.TotalStudents * response.TotalAssessments;

            response.OverallCompletionPercentage = totalPossibleGrades > 0 ?
                Math.Round((double)totalCompletedGrades / totalPossibleGrades * 100, 2) : 0;

            response.StudentsWithFinalGrades = studentGrades.Count(sg => sg.FinalScore.HasValue);
            response.StudentsWithoutFinalGrades = response.TotalStudents - response.StudentsWithFinalGrades;

            return response;
        }
        private string GetEnrollmentStatusInVietnamese(EnrollmentStatus status)
        {
            return status switch
            {
                EnrollmentStatus.Enrolled => "Đã đăng ký",
                EnrollmentStatus.Dropped => "Đã hủy",
                EnrollmentStatus.Completed => "Đã hoàn thành",
                _ => "Unknown"
            };
        }
        public async Task<BulkGradeResponse> CreateBulkGradesAsync(BulkGradeRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var response = new BulkGradeResponse
                {
                    TotalProcessed = request.StudentGrades.Count
                };

                // Validate assessment exists
                var assessment = await context.Assessment
                    .Include(a => a.AssessmentType)
                    .Include(a => a.Section)
                        .ThenInclude(s => s.Semester)
                    .FirstOrDefaultAsync(a => a.AssessmentId == request.AssessmentId);

                if (assessment == null)
                {
                    response.GeneralErrors.Add("Assessment not found");
                    return response;
                }

                // Get all student IDs to validate
                var studentIds = request.StudentGrades.Select(sg => sg.StudentId).ToList();
                var students = await context.Students
                    .Include(s => s.User)
                    .Where(s => studentIds.Contains(s.Id))
                    .ToDictionaryAsync(s => s.Id, s => s);

                // Check for existing grades
                var existingGrades = await context.Grades
                    .Where(g => g.Assessment.AssessmentId == request.AssessmentId &&
                               studentIds.Contains(g.Student.Id))
                    .ToDictionaryAsync(g => g.Student.Id, g => g);

                var processResults = new List<GradeProcessResult>();
                var gradesToAdd = new List<Grade>();
                var studentsToUpdateFinalResult = new List<int>();

                foreach (var studentGrade in request.StudentGrades)
                {
                    var result = new GradeProcessResult
                    {
                        StudentId = studentGrade.StudentId
                    };

                    // Validate student exists
                    if (!students.TryGetValue(studentGrade.StudentId, out var student))
                    {
                        result.IsSuccess = false;
                        result.ErrorMessage = "Student not found";
                        processResults.Add(result);
                        continue;
                    }

                    result.StudentName = student.User.FullName;
                    result.MSSV = student.MSSV;

                    // Check if grade already exists
                    if (existingGrades.ContainsKey(studentGrade.StudentId))
                    {
                        result.IsSuccess = false;
                        result.ErrorMessage = "Grade already exists for this student and assessment";
                        processResults.Add(result);
                        continue;
                    }

                    // Validate score range (0-10)
                    if (studentGrade.Score < 0 || studentGrade.Score > 10)
                    {
                        result.IsSuccess = false;
                        result.ErrorMessage = "Score must be between 0 and 10";
                        processResults.Add(result);
                        continue;
                    }

                    // Verify student is enrolled in this section
                    var isEnrolled = await context.Enrollments
                        .AnyAsync(e => e.Student.Id == studentGrade.StudentId &&
                                     e.Section.SectionId == assessment.Section.SectionId &&
                                     e.enrollmentStatus == EnrollmentStatus.Enrolled);

                    if (!isEnrolled)
                    {
                        result.IsSuccess = false;
                        result.ErrorMessage = "Student is not enrolled in this section";
                        processResults.Add(result);
                        continue;
                    }

                    // Create grade object
                    var grade = new Grade
                    {
                        Student = student,
                        Assessment = assessment,
                        Score = studentGrade.Score
                    };

                    gradesToAdd.Add(grade);
                    studentsToUpdateFinalResult.Add(studentGrade.StudentId);

                    result.IsSuccess = true;
                    result.Score = studentGrade.Score;
                    processResults.Add(result);
                }

                // Add all valid grades
                if (gradesToAdd.Any())
                {
                    context.Grades.AddRange(gradesToAdd);
                    await context.SaveChangesAsync();

                    // Update GradeIds in results
                    var addedGrades = gradesToAdd.ToDictionary(g => g.Student.Id, g => g.GradeId);
                    foreach (var result in processResults.Where(r => r.IsSuccess))
                    {
                        if (addedGrades.TryGetValue(result.StudentId, out var gradeId))
                        {
                            result.GradeId = gradeId;
                        }
                    }
                }

                // Update final results and GPA if this is a final exam assessment
                if (assessment.AssessmentType.AssessmentTypeId == 4 && studentsToUpdateFinalResult.Any())
                {
                    foreach (var studentId in studentsToUpdateFinalResult.Distinct())
                    {
                        try
                        {
                            await UpdateFinalResultAsync(studentId, assessment.Section.SectionId);
                            await UpdateGpaSnapshotAsync(studentId, assessment.Section.Semester.SemesterId);
                        }
                        catch (Exception ex)
                        {
                            // Log but don't fail the entire operation
                            Console.WriteLine($"Failed to update final result for student {studentId}: {ex.Message}");
                        }
                    }
                }

                await transaction.CommitAsync();

                // Prepare response
                response.Results = processResults;
                response.SuccessfulCount = processResults.Count(r => r.IsSuccess);
                response.FailedCount = processResults.Count(r => !r.IsSuccess);
                response.IsSuccess = response.SuccessfulCount > 0;
                response.Message = $"Processed {response.TotalProcessed} grades: {response.SuccessfulCount} successful, {response.FailedCount} failed";

                return response;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new BulkGradeResponse
                {
                    IsSuccess = false,
                    Message = "Bulk grade creation failed due to system error",
                    GeneralErrors = { ex.Message },
                    TotalProcessed = request.StudentGrades.Count
                };
            }
        }
        private (string gradeLetter, double gradePoint) CalculateGradeLetterAndPoint(double finalScore)
        {
            // Giới hạn điểm trong khoảng 0 - 10 để tránh lỗi
            finalScore = Math.Clamp(finalScore, 0.0, 10.0);

            // Quy đổi điểm chữ (gradeLetter)
            string gradeLetter = finalScore switch
            {
                >= 8.5 => "A",
                >= 8.0 => "B+",
                >= 7.0 => "B",
                >= 6.5 => "C+",
                >= 5.5 => "C",
                >= 5.0 => "D+",
                >= 4.0 => "D",
                _ => "F"
            };

            // Quy đổi điểm hệ 4 theo tỷ lệ
            double gradePoint = Math.Round(finalScore / 10 * 4, 2);

            return (gradeLetter, gradePoint);
        }

        public Task<bool> updateGradeAuto(int studentId)
        {
            var grades = context.Grades
                .Include(g => g.Student)
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.AssessmentType)
              .Include(g => g.Assessment)
                    .ThenInclude(a => a.Section)
                      .ThenInclude(g => g.Semester)
                .Where(g => g.Student.Id == studentId && g.Assessment.AssessmentType.AssessmentTypeId == 4)
                .ToList();

            foreach (var grade in grades)
                {
                UpdateFinalResultAsync(grade.Student.Id, grade.Assessment.Section.SectionId).Wait();
                UpdateGpaSnapshotAsync(grade.Student.Id, grade.Assessment.Section.Semester.SemesterId).Wait();
            }
            return Task.FromResult(true);

        }
    }
}