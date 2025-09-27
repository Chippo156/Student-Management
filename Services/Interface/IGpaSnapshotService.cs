using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IGpaSnapshotService
    {
        Task<GpaSnapshot?> GetGpaSnapshotByIdAsync(int gpaSnapshotId);
        Task<IEnumerable<GpaSnapshot>> GetAllGpaSnapshotsAsync();
        Task<GpaSnapshot> CreateGpaSnapshotAsync(GpaSnapshotRequest request);
        Task<GpaSnapshot?> UpdateGpaSnapshotAsync(int gpaSnapshotId, GpaSnapshotRequest request);
        Task<bool> DeleteGpaSnapshotAsync(int gpaSnapshotId);
        Task<IEnumerable<GpaSnapshot>> GetGpaSnapshotsByStudentAsync(int studentId);
        Task<GpaSnapshot?> GetLatestGpaSnapshotByStudentAsync(int studentId);
    }
}