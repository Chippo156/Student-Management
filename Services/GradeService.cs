using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
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

                if (gradeGroup.Key == 1) // Regular grades - take average
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

    }
}