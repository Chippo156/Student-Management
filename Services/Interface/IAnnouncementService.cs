using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IAnnouncementService
    {
        Task<Announcement> CreateAnnouncementAsync(AnnouncementRequest request, string createdByUsername);
        Task<AnnouncementResponse?> GetAnnouncementByIdAsync(int announcementId);
        Task<PagedResult<AnnouncementListResponse>> GetAnnouncementsForUserAsync(
            string username, 
            PaginationParams pagination,
            AnnouncementType? type = null,
            AnnouncementPriority? priority = null,
            bool? onlyActive = true);
        Task<PagedResult<AnnouncementResponse>> GetAllAnnouncementsAsync(
            PaginationParams pagination,
            string? search = null,
            AnnouncementType? type = null,
            AnnouncementPriority? priority = null,
            AnnouncementTargetType? targetType = null,
            bool? isActive = null);
        Task<Announcement?> UpdateAnnouncementAsync(int announcementId, AnnouncementRequest request);
        Task<bool> DeleteAnnouncementAsync(int announcementId);
        Task<int> GetUnreadCountForUserAsync(string username);
    }
}