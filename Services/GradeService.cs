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
        public async Task<Grade> CreateGradeAsync(GradeRequest request)
        {
            var student = await context.Students.FindAsync(request.StudentId)
                ?? throw new Exception("Student not found");

            var assessment = await context.Assessment.FindAsync(request.AssessmentId)
                ?? throw new Exception("Assessment not found");

            Grade grade = new Grade
            {
                Student = student,
                Assessment = assessment,
                Score = request.Score
            };

            context.Grades.Add(grade);
            await context.SaveChangesAsync();
            return grade;
        }

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

        public async Task<Grade?> UpdateGradeAsync(int gradeId, GradeRequest request)
        {
            var grade = await context.Grades.FindAsync(gradeId);
            if (grade is null)
            {
                return null;
            }

            if (request.StudentId != grade.Student.Id)
            {
                var student = await context.Students.FindAsync(request.StudentId);
                if (student is null)
                {
                    throw new Exception("Student not found");
                }
                grade.Student = student;
            }

            if (request.AssessmentId != grade.Assessment.AssessmentId)
            {
                var assessment = await context.Assessment.FindAsync(request.AssessmentId);
                if (assessment is null)
                {
                    throw new Exception("Assessment not found");
                }
                grade.Assessment = assessment;
            }

            grade.Score = request.Score;

            context.Grades.Update(grade);
            await context.SaveChangesAsync();
            return grade;
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
                    .ThenInclude(s => s.CurriculumCourse)
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
                    .ThenInclude(s => s.CurriculumCourse)
                .Include(g => g.Assessment.Section.Semester)
                .Where(g => g.Student.MSSV == mssv)
                .ToListAsync();

            // Get all final results for this student
            var finalResults = await context.FinalResults
                .Include(fr => fr.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                .Include(fr => fr.Section.Semester)
                .Where(fr => fr.Student.MSSV == mssv)
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

            foreach (var semesterGroup in gradesBySemester)
            {
                var semester = semesterGroup.Key;
                var semesterGrades = semesterGroup.ToList();

                // Get GPA for this semester
                var semesterGpa = gpaSnapshots
                    .FirstOrDefault(g => g.Semester.SemesterId == semester.SemesterId);

                var semesterDetail = new SemesterGradesDetail
                {
                    SemesterId = semester.SemesterId,
                    SemesterName = $"{semester.Year} - {semester.Term}",
                    Year = semester.Year,
                    Term = semester.Term,
                    SemesterGPA = semesterGpa?.Gpa ?? 0.0
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
    }
}