using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IAssessmentService
    {
        Task<Assessment?> GetAssessmentByIdAsync(int assessmentId);
        Task<IEnumerable<Assessment>> GetAllAssessmentsAsync();
        Task<Assessment> CreateAssessmentAsync(AssessmentRequest request);
        Task<Assessment?> UpdateAssessmentAsync(int assessmentId, AssessmentRequest request);
        Task<bool> DeleteAssessmentAsync(int assessmentId);
        Task<IEnumerable<Assessment>> GetAssessmentsBySectionAsync(int sectionId);
    }
}