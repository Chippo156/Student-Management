using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AssessmentService(AppDbContext context) : IAssessmentService
    {
        public async Task<Assessment> CreateAssessmentAsync(AssessmentRequest request)
        {
            var section = await context.Sections.FindAsync(request.SectionId)
                ?? throw new Exception("Section not found");

            Assessment assessment = new Assessment
            {
                Section = section,
                Title = request.Title,
                Weight = request.Weight
            };

            context.Assessment.Add(assessment);
            await context.SaveChangesAsync();
            return assessment;
        }

        public async Task<bool> DeleteAssessmentAsync(int assessmentId)
        {
            var assessment = await context.Assessment.FindAsync(assessmentId);
            if (assessment is null)
            {
                return false;
            }

            context.Assessment.Remove(assessment);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Assessment>> GetAllAssessmentsAsync()
        {
            return await context.Assessment
                .Include(a => a.Section)
                    .ThenInclude(s => s.Course)
                .ToListAsync();
        }

        public async Task<Assessment?> GetAssessmentByIdAsync(int assessmentId)
        {
            return await context.Assessment
                .Include(a => a.Section)
                    .ThenInclude(s => s.Course)
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId);
        }

        public async Task<IEnumerable<Assessment>> GetAssessmentsBySectionAsync(int sectionId)
        {
            return await context.Assessment
                .Include(a => a.Section)
                .Where(a => a.Section.SectionId == sectionId)
                .ToListAsync();
        }

        public async Task<Assessment?> UpdateAssessmentAsync(int assessmentId, AssessmentRequest request)
        {
            var assessment = await context.Assessment.FindAsync(assessmentId);
            if (assessment is null)
            {
                return null;
            }

            if (request.SectionId != assessment.Section.SectionId)
            {
                var section = await context.Sections.FindAsync(request.SectionId);
                if (section is null)
                {
                    throw new Exception("Section not found");
                }
                assessment.Section = section;
            }

            assessment.Title = request.Title;
            assessment.Weight = request.Weight;

            context.Assessment.Update(assessment);
            await context.SaveChangesAsync();
            return assessment;
        }
    }
}