using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AnnouncementService(AppDbContext context) : IAnnouncementService
    {
        public async Task<Announcement> CreateAnnouncementAsync(AnnouncementRequest request, string createdByUsername)
        {
            var creator = await context.Users
                .FirstOrDefaultAsync(u => u.Username == createdByUsername)
                ?? throw new Exception("Không tìm thấy thông tin người tạo");



            if (request.TargetType == AnnouncementTargetType.AcademicYear && !request.TargetYear.HasValue)
            {
                throw new Exception("TargetYear là bắt buộc khi TargetType là AcademicYear");
            }

            // Validate department exists if specified
            if (request.TargetDepartmentId.HasValue)
            {
                var departmentExists = await context.Departments
                    .AnyAsync(d => d.DepartmentId == request.TargetDepartmentId.Value);
                if (!departmentExists)
                {
                    throw new Exception("Department not found");
                }
            }

            var announcement = new Announcement
            {
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                Priority = request.Priority,
                Type = request.Type,
                TargetType = request.TargetType,
                TargetDepartmentId = request.TargetDepartmentId,
                TargetYear = request.TargetYear,
                ExpiryDate = request.ExpiryDate,
                CreatedByUserId = creator.UserId,
                CreatedByUser = creator
            };
            if (request.SourceUrl != null)
            {
                announcement.SourceUrl = request.SourceUrl.Trim();
            }

            context.Announcements.Add(announcement);
            await context.SaveChangesAsync();

            return announcement;
        }

        public async Task<AnnouncementResponse?> GetAnnouncementByIdAsync(int announcementId)
        {
            var announcement = await context.Announcements
                .Include(a => a.CreatedByUser)
                .Include(a => a.TargetDepartment)
                .FirstOrDefaultAsync(a => a.AnnouncementId == announcementId);

            if (announcement == null)
                return null;

            return MapToAnnouncementResponse(announcement);
        }

        public async Task<PagedResult<AnnouncementListResponse>> GetAnnouncementsForUserAsync(
            string username, 
            PaginationParams pagination,
            AnnouncementType? type = null,
            AnnouncementPriority? priority = null,
            bool? onlyActive = true)
        {
            var user = await context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username)
                ?? throw new Exception("User not found");

            // Get user's department if they are student or lecturer
            int? userDepartmentId = null;
            int? userYear = null;

            if (user.Role.RoleId == 2) // Student
            {
                var student = await context.Students
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                            .ThenInclude(p => p.Department)
                    .FirstOrDefaultAsync(s => s.User.UserId == user.UserId);

                if (student != null)
                {
                    userDepartmentId = student.Class.Program.Department.DepartmentId;
                    userYear = student.YearOfAdmission;
                }
            }
            else if (user.Role.RoleId == 3) // Lecturer
            {
                var lecturer = await context.Lecturers
                    .Include(l => l.Department)
                    .FirstOrDefaultAsync(l => l.User.UserId == user.UserId);

                if (lecturer != null)
                {
                    userDepartmentId = lecturer.Department.DepartmentId;
                }
            }

            var query = context.Announcements
                .Include(a => a.CreatedByUser)
                .Include(a => a.TargetDepartment)
                .Where(a => 
                    // Target filtering based on user type and department
                    a.TargetType == AnnouncementTargetType.All ||
                    (a.TargetType == AnnouncementTargetType.Students && user.Role.RoleId == 2) ||
                    (a.TargetType == AnnouncementTargetType.Lecturers && user.Role.RoleId == 3) ||
                    (a.TargetType == AnnouncementTargetType.AcademicYear && a.TargetYear == userYear)
                );

            // Apply filters
            if (onlyActive == true)
            {
                query = query.Where(a => a.IsActive && 
                                    (a.ExpiryDate == null || a.ExpiryDate > DateTime.Now));
            }

            if (type.HasValue)
            {
                query = query.Where(a => a.Type == type.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(a => a.Priority == priority.Value);
            }

            var totalCount = await query.CountAsync();

            var announcements = await query
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var responses = announcements.Select(a => new AnnouncementListResponse
            {
                AnnouncementId = a.AnnouncementId,
                Title = a.Title,
                Content = a.Content,
                SourceUrl = a.SourceUrl,
                CreatedAt = a.CreatedAt,
                ExpiryDate = a.ExpiryDate,
                IsActive = a.IsActive,
                Priority = a.Priority,
                PriorityText = GetPriorityText(a.Priority),
                PriorityColor = GetPriorityColor(a.Priority),
                Type = a.Type,
                TypeText = GetTypeText(a.Type),
                TypeIcon = GetTypeIcon(a.Type),
                TargetType = a.TargetType,
                TargetTypeText = GetTargetTypeText(a.TargetType),
                TargetDescription = GetTargetDescription(a),
                CreatedByUserName = a.CreatedByUser.Username,
                CreatedByFullName = a.CreatedByUser.FullName,
                IsExpired = a.ExpiryDate.HasValue && a.ExpiryDate.Value <= DateTime.Now,
                DaysUntilExpiry = a.ExpiryDate.HasValue ? 
                    Math.Max(0, (int)(a.ExpiryDate.Value - DateTime.Now).TotalDays) : -1,
                ViewCount = 0, // TODO: Implement view tracking
                LastViewedAt = null // TODO: Implement view tracking
            }).ToList();

            return new PagedResult<AnnouncementListResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<PagedResult<AnnouncementResponse>> GetAllAnnouncementsAsync(
            PaginationParams pagination,
            string? search = null,
            AnnouncementType? type = null,
            AnnouncementPriority? priority = null,
            AnnouncementTargetType? targetType = null,
            bool? isActive = null)
        {
            var query = context.Announcements
                .Include(a => a.CreatedByUser)
                .Include(a => a.TargetDepartment)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(a =>
                    a.Title.ToLower().Contains(searchTerm) ||
                    a.Content.ToLower().Contains(searchTerm));
            }

            if (type.HasValue)
            {
                query = query.Where(a => a.Type == type.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(a => a.Priority == priority.Value);
            }

            if (targetType.HasValue)
            {
                query = query.Where(a => a.TargetType == targetType.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(a => a.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var announcements = await query
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var responses = announcements.Select(MapToAnnouncementResponse).ToList();

            return new PagedResult<AnnouncementResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<Announcement?> UpdateAnnouncementAsync(int announcementId, AnnouncementRequest request)
        {
            var announcement = await context.Announcements
                .FirstOrDefaultAsync(a => a.AnnouncementId == announcementId);

            if (announcement == null)
                return null;



            if (request.TargetType == AnnouncementTargetType.AcademicYear && !request.TargetYear.HasValue)
            {
                throw new Exception("TargetYear là bắt buộc khi TargetType là AcademicYear");
            }

            announcement.Title = request.Title.Trim();
            announcement.Content = request.Content.Trim();
            announcement.SourceUrl = request.SourceUrl.Trim();
            announcement.Priority = request.Priority;
            announcement.Type = request.Type;
            announcement.TargetType = request.TargetType;
            announcement.TargetDepartmentId = request.TargetDepartmentId;
            announcement.TargetYear = request.TargetYear;
            announcement.ExpiryDate = request.ExpiryDate;

            context.Announcements.Update(announcement);
            await context.SaveChangesAsync();

            return announcement;
        }

        public async Task<bool> DeleteAnnouncementAsync(int announcementId)
        {
            var announcement = await context.Announcements
                .FirstOrDefaultAsync(a => a.AnnouncementId == announcementId);

            if (announcement == null)
                return false;

            context.Announcements.Remove(announcement);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<int> GetUnreadCountForUserAsync(string username)
        {
            var user = await context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username)
                ?? throw new Exception("User not found");

            // Get user's department and year (similar logic as in GetAnnouncementsForUserAsync)
            int? userDepartmentId = null;
            int? userYear = null;

            if (user.Role.RoleId == 2) // Student
            {
                var student = await context.Students
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                            .ThenInclude(p => p.Department)
                    .FirstOrDefaultAsync(s => s.User.UserId == user.UserId);

                if (student != null)
                {
                    userDepartmentId = student.Class.Program.Department.DepartmentId;
                    userYear = student.YearOfAdmission;
                }
            }
            else if (user.Role.RoleId == 3) // Lecturer
            {
                var lecturer = await context.Lecturers
                    .Include(l => l.Department)
                    .FirstOrDefaultAsync(l => l.User.UserId == user.UserId);

                if (lecturer != null)
                {
                    userDepartmentId = lecturer.Department.DepartmentId;
                }
            }

            return await context.Announcements
                .Where(a => 
                    a.IsActive &&
                    (a.ExpiryDate == null || a.ExpiryDate > DateTime.Now) &&
                    (a.TargetType == AnnouncementTargetType.All ||
                    (a.TargetType == AnnouncementTargetType.Students && user.Role.RoleId == 2) ||
                    (a.TargetType == AnnouncementTargetType.Lecturers && user.Role.RoleId == 3) ||
                    (a.TargetType == AnnouncementTargetType.AcademicYear && a.TargetYear == userYear))
                )
                .CountAsync();
        }

        public async Task<PagedResult<AnnouncementListResponse>> GetPublicAnnouncementsByTypeAsync(
            AnnouncementType type,
            PaginationParams pagination)
        {
            var query = context.Announcements
                .Include(a => a.CreatedByUser)
                .Include(a => a.TargetDepartment)
                .Where(a => 
                    a.Type == type &&
                    a.IsActive && 
                    (a.ExpiryDate == null || a.ExpiryDate > DateTime.Now) &&
                    (a.TargetType == AnnouncementTargetType.All || 
                     a.TargetType == AnnouncementTargetType.Students || 
                     a.TargetType == AnnouncementTargetType.Lecturers) // Chỉ lấy thông báo công khai
                );

            var totalCount = await query.CountAsync();

            var announcements = await query
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var responses = announcements.Select(a => new AnnouncementListResponse
            {
                AnnouncementId = a.AnnouncementId,
                Title = a.Title,
                Content = a.Content,
                SourceUrl = a.SourceUrl,
                CreatedAt = a.CreatedAt,
                ExpiryDate = a.ExpiryDate,
                IsActive = a.IsActive,
                Priority = a.Priority,
                PriorityText = GetPriorityText(a.Priority),
                PriorityColor = GetPriorityColor(a.Priority),
                Type = a.Type,
                TypeText = GetTypeText(a.Type),
                TypeIcon = GetTypeIcon(a.Type),
                TargetType = a.TargetType,
                TargetTypeText = GetTargetTypeText(a.TargetType),
                TargetDescription = GetTargetDescription(a),
                CreatedByUserName = a.CreatedByUser.Username,
                CreatedByFullName = a.CreatedByUser.FullName,
                IsExpired = a.ExpiryDate.HasValue && a.ExpiryDate.Value <= DateTime.Now,
                DaysUntilExpiry = a.ExpiryDate.HasValue ? 
                    Math.Max(0, (int)(a.ExpiryDate.Value - DateTime.Now).TotalDays) : -1,
                ViewCount = 0, // TODO: Implement view tracking if needed
                LastViewedAt = null // TODO: Implement view tracking if needed
            }).ToList();

            return new PagedResult<AnnouncementListResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        private static AnnouncementResponse MapToAnnouncementResponse(Announcement announcement)
        {
            return new AnnouncementResponse
            {
                AnnouncementId = announcement.AnnouncementId,
                Title = announcement.Title,
                Content = announcement.Content,
                SourceUrl = announcement.SourceUrl,
                CreatedAt = announcement.CreatedAt,
                ExpiryDate = announcement.ExpiryDate,
                IsActive = announcement.IsActive,
                Priority = announcement.Priority,
                PriorityText = GetPriorityText(announcement.Priority),
                PriorityColor = GetPriorityColor(announcement.Priority),
                Type = announcement.Type,
                TypeText = GetTypeText(announcement.Type),
                TypeIcon = GetTypeIcon(announcement.Type),
                TargetType = announcement.TargetType,
                TargetTypeText = GetTargetTypeText(announcement.TargetType),
                TargetDescription = GetTargetDescription(announcement),
                CreatedByUserName = announcement.CreatedByUser.Username,
                CreatedByFullName = announcement.CreatedByUser.FullName,
                IsExpired = announcement.ExpiryDate.HasValue && announcement.ExpiryDate.Value <= DateTime.Now,
                DaysUntilExpiry = announcement.ExpiryDate.HasValue ? 
                    Math.Max(0, (int)(announcement.ExpiryDate.Value - DateTime.Now).TotalDays) : -1
            };
        }

        private static string GetPriorityText(AnnouncementPriority priority)
        {
            return priority switch
            {
                AnnouncementPriority.Low => "Thấp",
                AnnouncementPriority.Normal => "Bình thường",
                AnnouncementPriority.High => "Cao",
                AnnouncementPriority.Urgent => "Khẩn cấp",
                _ => "Không xác định"
            };
        }

        private static string GetPriorityColor(AnnouncementPriority priority)
        {
            return priority switch
            {
                AnnouncementPriority.Low => "#6c757d",      // Gray
                AnnouncementPriority.Normal => "#0d6efd",   // Blue  
                AnnouncementPriority.High => "#fd7e14",     // Orange
                AnnouncementPriority.Urgent => "#dc3545",  // Red
                _ => "#6c757d"
            };
        }

        private static string GetTypeText(AnnouncementType type)
        {
            return type switch
            {
                AnnouncementType.General => "Thông báo chung",
                AnnouncementType.Academic => "Học tập",
                AnnouncementType.Event => "Sự kiện",
                AnnouncementType.Tuition => "Học phí",
                AnnouncementType.Emergency => "Khẩn cấp",
                _ => "Không xác định"
            };
        }

        private static string GetTypeIcon(AnnouncementType type)
        {
            return type switch
            {
                AnnouncementType.General => "📢",
                AnnouncementType.Academic => "📚",
                AnnouncementType.Event => "🎉",
                AnnouncementType.Tuition => "💰",
                AnnouncementType.Emergency => "🚨",
                _ => "📝"
            };
        }

        private static string GetTargetTypeText(AnnouncementTargetType targetType)
        {
            return targetType switch
            {
                AnnouncementTargetType.All => "Tất cả",
                AnnouncementTargetType.Students => "Sinh viên",
                AnnouncementTargetType.Lecturers => "Giảng viên",
                AnnouncementTargetType.AcademicYear => "Theo năm học",
                _ => "Không xác định"
            };
        }

        private static string GetTargetDescription(Announcement announcement)
        {
            return announcement.TargetType switch
            {
                AnnouncementTargetType.All => "Tất cả người dùng",
                AnnouncementTargetType.Students => "Tất cả sinh viên",
                AnnouncementTargetType.Lecturers => "Tất cả giảng viên",
                AnnouncementTargetType.AcademicYear => $"Sinh viên khóa {announcement.TargetYear}",
                _ => "Không xác định"
            };
        }
    }
}