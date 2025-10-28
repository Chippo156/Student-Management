using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IPracticeGroupService
    {
        Task<PracticeGroup> CreatePracticeGroupAsync(PracticeGroupRequest request);
        Task<PracticeGroupResponse?> GetPracticeGroupByIdAsync(int practiceGroupId);
        Task<IEnumerable<PracticeGroupResponse>> GetPracticeGroupsBySectionAsync(int sectionId);
        Task<PracticeGroup?> UpdatePracticeGroupAsync(int practiceGroupId, PracticeGroupRequest request);
        Task<bool> DeletePracticeGroupAsync(int practiceGroupId);
        
        Task<bool> EnrollStudentInPracticeGroupAsync(int practiceGroupId, int studentId);
        Task<bool> RemoveStudentFromPracticeGroupAsync(int practiceGroupId, int studentId);
        Task<IEnumerable<PracticeGroupResponse>> GetAvailablePracticeGroupsAsync(int sectionId);
        Task<PracticeGroupResponse?> GetStudentPracticeGroupAsync(int studentId, int sectionId);
        
        Task<Schedule> AddPracticeScheduleAsync(PracticeScheduleRequest request);
        Task<bool> RemovePracticeScheduleAsync(int scheduleId);
        Task<IEnumerable<Schedule>> GetPracticeGroupSchedulesAsync(int practiceGroupId);
        
        Task<bool> AutoAssignStudentsToPracticeGroupsAsync(int sectionId);
    }
}