using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IReportService
    {
        Task<CreditStatisticsResponse> GetStudentCreditStatisticsAsync(int studentId);
        Task<SemesterCreditDetail> GetStudentSemesterStatisticsAsync(string mssv, int semesterId);
        Task<CreditStudentResponse> GetStudentCreditStatisticsByMSSVAsync(string mssv);
        Task<StudentAcademicSummaryResponse> GetStudentAcademicSummaryAsync(string mssv, int semesterId);
        Task<StatisticsOverviewResponse> GetStatisticsOverviewAsync();
        Task<StudentStatusStatisticsResponse> GetStudentStatusStatisticsAsync();
        Task<SimpleYearlyGrowthResponse> GetSimpleYearlyGrowthAsync(int years = 7);

    }
}