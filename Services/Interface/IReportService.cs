using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IReportService
    {
        Task<CreditStatisticsResponse> GetStudentCreditStatisticsAsync(int studentId);
        Task<SemesterCreditDetail> GetStudentSemesterStatisticsAsync(string mssv, int semesterId);
    }
}