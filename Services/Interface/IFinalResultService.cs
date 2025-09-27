using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IFinalResultService
    {
        Task<FinalResult?> GetFinalResultByIdAsync(int finalResultId);
        Task<IEnumerable<FinalResult>> GetAllFinalResultsAsync();
        Task<FinalResult> CreateFinalResultAsync(FinalResultRequest request);
        Task<FinalResult?> UpdateFinalResultAsync(int finalResultId, FinalResultRequest request);
        Task<bool> DeleteFinalResultAsync(int finalResultId);
        Task<IEnumerable<FinalResult>> GetFinalResultsByStudentAsync(int studentId);
        Task<IEnumerable<FinalResult>> GetFinalResultsBySectionAsync(int sectionId);
    }
}