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
                .Include(g =>  g.Assessment)
                    .ThenInclude(a => a.Section)
                .Where(g => g.Student.Id == studentId && g.Assessment.Section.Semester.SemesterId == semeter)
                .ToListAsync();

        }
        public async Task<IEnumerable<StudentSectionGradesResponse>> GetStudentSemesterGradesBySectionsAsync(string mssv, int semesterId)
        {
            // Get all enrollments for this student in the specified semester
            var enrollments = await context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.Course)
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
                    CourseCode = section.Course.CourseCode,
                    CourseName = section.Course.CourseName,
                    Credits = section.Course.CreditsTheory + section.Course.CreditsLab,
                    FinalScore = finalResult?.FinalScore,
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
                        Score = grade?.Score ?? 0 // If no grade, default to 0
                    });
                }

                response.Add(sectionGrades);
            }

            return response;
        }
    }
}