using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface ILecturerService
    {
        Task<Lecturer?> GetLecturerByIdAsync(int lecturerId);
        Task<IEnumerable<Lecturer>> GetAllLecturersAsync();
        Task<Lecturer> CreateLecturerAsync(LecturerRequest lecturer);
        Task<bool> DeleteLecturerAsync(int lecturerId);
        Task<LecturerDetailResponse?> GetLecturerDetailByCodeAsync(string lecturerCode);

    }
}
