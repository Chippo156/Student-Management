using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IAttendanceService
    {
        Task<AttendanceSession> CreateAttendanceSessionAsync(CreateAttendanceSessionRequest request, string lecturerCode);
        Task<AttendanceSessionResponse> RecordAttendanceAsync(RecordAttendanceRequest request, string lecturerCode);
        Task<AttendanceSessionResponse> GetAttendanceSessionByIdAsync(int attendanceSessionId);
        Task<PagedResult<AttendanceSessionResponse>> GetAttendanceSessionsByLecturerAsync(
            string lecturerCode, 
            PaginationParams pagination,
            int? sectionId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);
        Task<StudentAttendanceStatisticsResponse> GetStudentAttendanceStatisticsAsync(int studentId, int sectionId);
        Task<bool> UpdateAttendanceAsync(int attendanceId, UpdateAttendanceRequest request, string lecturerCode);
        Task<bool> DeleteAttendanceSessionAsync(int attendanceSessionId, string lecturerCode);
    }
}