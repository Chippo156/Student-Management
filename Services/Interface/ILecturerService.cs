using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ILecturerService
    {
        Task<Lecturer?> GetLecturerByIdAsync(int lecturerId);
        Task<PagedResult<Lecturer>> GetAllLecturersAsync(PaginationParams pagination, string? search = null);

        Task<Lecturer> CreateLecturerAsync(LecturerRequest lecturer);
        Task<bool> DeleteLecturerAsync(int lecturerId);
        Task<LecturerDetailResponse?> GetLecturerDetailByCodeAsync(string lecturerCode);

    }
}
