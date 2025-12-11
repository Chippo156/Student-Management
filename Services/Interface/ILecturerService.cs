using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ILecturerService
    {
        Task<Lecturer?> GetLecturerByIdAsync(int lecturerId);
        Task<PagedResult<Lecturer>> GetAllLecturersAsync(
            PaginationParams pagination, 
            string? search = null,
            int? departmentId = null,
            string? position = null,
            string? academicTitle = null,
            LecturerStatus? lecturerStatus = null);

        Task<Lecturer> CreateLecturerAsync(LecturerRequest lecturer);
        Task<bool> DeleteLecturerAsync(int lecturerId);
        Task<LecturerDetailResponse?> GetLecturerDetailByCodeAsync(string lecturerCode);
        Task<IEnumerable<LecturerDropdownResponse>> GetLecturerDropdownsByDepartmentIdAsync(int departmentId);
        Task<Lecturer?> UpdateLecturerProfileAsync(string lecturerCode, LecturerUpdateRequest request);


    }
}
