using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class FinalResultService(AppDbContext context) : IFinalResultService
    {
        public async Task<FinalResult> CreateFinalResultAsync(FinalResultRequest request)
        {
            var section = await context.Sections.FindAsync(request.SectionId) 
                ?? throw new Exception("Section not found");
            
            var student = await context.Students.FindAsync(request.StudentId)
                ?? throw new Exception("Student not found");
            
            FinalResult finalResult = new FinalResult
            {
                Section = section,
                Student = student,
                FinalScore = request.FinalScore,
                GradeLetter = request.GradeLetter,
                GradePoint = request.GradePoint
            };

            context.FinalResults.Add(finalResult);
            await context.SaveChangesAsync();
            return finalResult;
        }

        public async Task<bool> DeleteFinalResultAsync(int finalResultId)
        {
            var finalResult = await context.FinalResults.FindAsync(finalResultId);
            if (finalResult is null)
            {
                return false;
            }

            context.FinalResults.Remove(finalResult);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<FinalResult>> GetAllFinalResultsAsync()
        {

            return await context.FinalResults
                .Include(f => f.Section)
                    .ThenInclude(s => s.Course)
                .Include(f => f.Student)
                    .ThenInclude(s => s.User)
                .ToListAsync();
        }

        public async Task<FinalResult?> GetFinalResultByIdAsync(int finalResultId)
        {
            return await context.FinalResults
                .Include(f => f.Section)
                    .ThenInclude(s => s.Course)
                .Include(f => f.Student)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(f => f.FinalResultId == finalResultId);
        }

        public async Task<IEnumerable<FinalResult>> GetFinalResultsBySectionAsync(int sectionId)
        {
            return await context.FinalResults
                .Include(f => f.Section)
                .Include(f => f.Student)
                    .ThenInclude(s => s.User)
                .Where(f => f.Section.SectionId == sectionId)
                .ToListAsync();
        }

        public async Task<IEnumerable<FinalResult>> GetFinalResultsByStudentAsync(int studentId)
        {
            return await context.FinalResults
                .Include(f => f.Section)
                    .ThenInclude(s => s.Course)
                .Include(f => f.Student)
                .Where(f => f.Student.Id == studentId)
                .ToListAsync();
        }

        public async Task<FinalResult?> UpdateFinalResultAsync(int finalResultId, FinalResultRequest request)
        {
            var finalResult = await context.FinalResults.FindAsync(finalResultId);
            if (finalResult is null)
            {
                return null;
            }

            if (request.SectionId != finalResult.Section.SectionId)
            {
                var section = await context.Sections.FindAsync(request.SectionId);
                if (section is null)
                {
                    throw new Exception("Section not found");
                }
                finalResult.Section = section;
            }

            if (request.StudentId != finalResult.Student.Id)
            {
                var student = await context.Students.FindAsync(request.StudentId);
                if (student is null)
                {
                    throw new Exception("Student not found");
                }
                finalResult.Student = student;
            }

            finalResult.FinalScore = request.FinalScore;
            finalResult.GradeLetter = request.GradeLetter;
            finalResult.GradePoint = request.GradePoint;

            context.FinalResults.Update(finalResult);
            await context.SaveChangesAsync();
            return finalResult;
        }
    }
}