using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IRegistrationPeriodService
    {
        Task<PagedResult<RegistrationPeriodResponse>> GetAllRegistrationPeriodsAsync(
            PaginationParams pagination,
            int? semesterId = null,
            int? departmentId = null,
            bool? isActive = null);
        
        Task<RegistrationPeriodDetailResponse?> GetRegistrationPeriodByIdAsync(int id);
        Task<RegistrationPeriod> CreateRegistrationPeriodAsync(RegistrationPeriodRequest request);
        Task<RegistrationPeriod?> UpdateRegistrationPeriodAsync(int id, UpdateRegistrationPeriodRequest request);
        Task<bool> DeleteRegistrationPeriodAsync(int id);
        Task<bool> ToggleRegistrationPeriodStatusAsync(int id);
        
        // Additional methods
        Task<List<RegistrationPeriodResponse>> GetActiveRegistrationPeriodsAsync();
        Task<RegistrationPeriodResponse?> GetActiveRegistrationPeriodByDepartmentAsync(int departmentId);
        Task<List<RegistrationPeriodResponse>> GetRegistrationPeriodsBySemesterAsync(int semesterId);
    }
}