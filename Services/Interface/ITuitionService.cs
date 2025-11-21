using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ITuitionService
    {
        Task<PagedResult<TuitionFeeResponse>> GetTuitionFeesWithPaginationAsync(TuitionSearchRequest request);
        Task<TuitionFeeResponse?> GetTuitionFeeByIdAsync(int tuitionFeeId);
        Task<StudentTuitionSummaryResponse?> GetStudentTuitionSummaryAsync(string mssv);
        Task<TuitionFeeResponse> GenerateTuitionForStudentAsync(string mssv, int semesterId);
        Task<TuitionPaymentResponse> ProcessPaymentAsync(ProcessPaymentRequest request, int processedByUserId);
        Task<bool> GenerateTuitionForSemesterAsync(GenerateTuitionRequest request);
        Task<List<TuitionFeeResponse>> GetOverdueTuitionFeesAsync();
        Task UpdateOverdueTuitionFeesAsync();
        Task<StudentTuitionDebtResponse> GetStudentTuitionDebtBySemesterAsync(string mssv, int? semesterId = null);
    }
}