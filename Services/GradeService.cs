using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
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
                    .ThenInclude(a => a.Section)
                        .ThenInclude(s => s.Course)
                .Where(g => g.Student.Id == studentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Grade>> GetGradesBySectionAndStudentAsync(int sectionId, int studentId)
        {
            return await context.Grades
                .Include(g => g.Student)
                .Include(g => g.Assessment)
                    .ThenInclude(a => a.Section)
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
    }
}