using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StudentManagement.Data;
using StudentManagement.Enum;

namespace StudentManagement.Services
{
    public class SectionManagementBackgroundService : BackgroundService
    {
        private readonly ILogger<SectionManagementBackgroundService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(2); // Chạy mỗi 2 tiếng

        public SectionManagementBackgroundService(
            ILogger<SectionManagementBackgroundService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Section Management Background Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessSectionManagementAsync();
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during section management processing");
                    await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken); // Retry sau 15 phút nếu có lỗi
                }
            }
        }

        private async Task ProcessSectionManagementAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                _logger.LogInformation("Starting section management process");

                var currentDate = DateTime.UtcNow;
                var today = DateOnly.FromDateTime(currentDate);

                // Step 1: Update section statuses
                var statusUpdateCount = await UpdateSectionStatusesAsync(context, currentDate, today);

                // Step 2: Check and cancel sections with insufficient enrollment
                var cancellationResult = await CheckAndCancelInsufficientSectionsAsync(context, currentDate);

                _logger.LogInformation(
                    "Section management completed: {StatusUpdates} status updates, {Cancellations} sections cancelled",
                    statusUpdateCount, cancellationResult.CancelledCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during section management processing");
                throw;
            }
        }

        private async Task<int> UpdateSectionStatusesAsync(AppDbContext context, DateTime currentDate, DateOnly today)
        {
            // Lấy tất cả sections cần cập nhật trạng thái
            var sectionsToUpdate = await context.Sections
                .Include(s => s.Semester)
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Program)
                        .ThenInclude(p => p.Department)
                .Include(s => s.Schedules)
                .Where(s => s.Status == SectionStatus.IsPreparing || s.Status == SectionStatus.IsOpening)
                .Where(s => !s.IsCancelled) // Không xử lý các section đã bị hủy
                .ToListAsync();

            var updatedCount = 0;

            foreach (var section in sectionsToUpdate)
            {
                var newStatus = await DetermineSectionStatusAsync(context, section, currentDate, today);
                
                if (newStatus != section.Status)
                {
                    section.Status = newStatus;
                    context.Sections.Update(section);
                    updatedCount++;
                    
                    _logger.LogInformation(
                        "Updated section {SectionCode} (ID: {SectionId}) status from {OldStatus} to {NewStatus}",
                        section.SectionCode ?? $"LHP{section.SectionId}", 
                        section.SectionId, 
                        section.Status, 
                        newStatus);
                }
            }

            if (updatedCount > 0)
            {
                await context.SaveChangesAsync();
            }

            return updatedCount;
        }

        private async Task<(int CancelledCount, List<string> CancelledSections)> CheckAndCancelInsufficientSectionsAsync(
            AppDbContext context, 
            DateTime currentDate)
        {
            // Lấy các registration periods đã kết thúc gần đây (trong vòng 24 giờ qua)
            var recentlyEndedPeriods = await context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                .Where(rp => rp.EndDate <= currentDate && 
                           rp.EndDate >= currentDate.AddHours(-24) && // Đã kết thúc trong 24h qua
                           rp.IsActive)
                .ToListAsync();

            var cancelledSections = new List<string>();
            var totalCancelled = 0;

            foreach (var period in recentlyEndedPeriods)
            {
                _logger.LogInformation(
                    "Processing ended registration period: {SemesterName}, Department: {DepartmentName}",
                    $"{period.Semester.Year} - {period.Semester.Term}",
                    period.Department.DepartmentName);

                // Lấy các sections thuộc department và semester này cần kiểm tra
                var sectionsToValidate = await context.Sections
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Program)
                    .Where(s => s.Semester.SemesterId == period.Semester.SemesterId &&
                               s.CurriculumCourse.Program.Department.DepartmentId == period.Department.DepartmentId &&
                               !s.IsCancelled &&
                               s.Status != SectionStatus.IsClosed)
                    .ToListAsync();

                foreach (var section in sectionsToValidate)
                {
                    var shouldCancel = await ShouldCancelSectionAsync(context, section);
                    
                    if (shouldCancel.ShouldCancel)
                    {
                        await CancelSectionAsync(context, section, shouldCancel.Reason);
                        
                        var sectionName = section.SectionCode ?? $"LHP{section.SectionId}";
                        cancelledSections.Add(sectionName);
                        totalCancelled++;
                        
                        _logger.LogWarning(
                            "Section {SectionName} cancelled: {Reason}",
                            sectionName, shouldCancel.Reason);
                    }
                }

                // Đánh dấu registration period đã được xử lý (có thể thêm field IsProcessed nếu cần)
                // period.IsProcessed = true;
            }

            if (totalCancelled > 0)
            {
                await context.SaveChangesAsync();
            }

            return (totalCancelled, cancelledSections);
        }

        private async Task<SectionStatus> DetermineSectionStatusAsync(
            AppDbContext context, 
            Models.Section section, 
            DateTime currentDate, 
            DateOnly today)
        {
            // 1. Kiểm tra có lịch học không
            var hasSchedules = section.Schedules.Any(s => !s.PracticeGroupId.HasValue);

            // 2. Lấy registration period
            var registrationPeriod = await context.RegistrationPeriods
                .FirstOrDefaultAsync(rp => 
                    rp.Semester.SemesterId == section.Semester.SemesterId &&
                    rp.Department.DepartmentId == section.CurriculumCourse.Program.Department.DepartmentId);

            // 3. Kiểm tra thời gian đăng ký
            bool isRegistrationActive = false;
            if (registrationPeriod != null)
            {
                isRegistrationActive = registrationPeriod.IsActive && 
                                     currentDate >= registrationPeriod.StartDate && 
                                     currentDate <= registrationPeriod.EndDate;
            }

            // 4. Kiểm tra thời gian học
            bool hasStartDatePassed = today >= section.StartDate;
            bool hasEndDatePassed = today > section.EndDate;

            // Logic xác định trạng thái
            if (hasEndDatePassed)
            {
                return SectionStatus.IsClosed;
            }

            if (!hasSchedules)
            {
                return SectionStatus.IsPreparing; // Chưa có lịch học
            }

            if (isRegistrationActive && !hasStartDatePassed)
            {
                return SectionStatus.IsOpening; // Đang trong thời gian đăng ký, chưa bắt đầu học
            }

            if (!isRegistrationActive && hasStartDatePassed)
            {
                return SectionStatus.IsClosed; // Đã hết thời gian đăng ký và đã bắt đầu học
            }

            if (!isRegistrationActive && !hasStartDatePassed)
            {
                return SectionStatus.IsOpening; // Đã hết thời gian đăng ký nhưng chưa bắt đầu học
            }

            return section.Status; // Giữ nguyên trạng thái hiện tại
        }

        private async Task<(bool ShouldCancel, string Reason)> ShouldCancelSectionAsync(
            AppDbContext context, 
            Models.Section section)
        {
            // Tính toán số lượng tối thiểu
            var minRequired = CalculateMinimumEnrollment(section);
            var currentEnrolled = section.EnrolledCount;

            if (currentEnrolled < minRequired)
            {
                return (true, $"Insufficient enrollment: {currentEnrolled}/{minRequired} students (minimum {section.MinEnrollmentPercentage * 100:F0}% of capacity)");
            }

            return (false, "");
        }

        private int CalculateMinimumEnrollment(Models.Section section)
        {
            // Cấu hình mặc định
            const double DEFAULT_MIN_PERCENTAGE = 0.5; // 50%
            const int ABSOLUTE_MIN_STUDENTS = 8; // Tối thiểu 8 sinh viên

            // Nếu section có cấu hình riêng
            if (section.MinEnrollment > 0)
            {
                return section.MinEnrollment;
            }

            // Nếu có phần trăm cấu hình
            if (section.MinEnrollmentPercentage > 0)
            {
                var calculatedMin = (int)Math.Ceiling(section.Capacity * section.MinEnrollmentPercentage);
                return Math.Max(calculatedMin, ABSOLUTE_MIN_STUDENTS);
            }

            // Sử dụng phần trăm mặc định
            var defaultMin = (int)Math.Ceiling(section.Capacity * DEFAULT_MIN_PERCENTAGE);
            return Math.Max(defaultMin, ABSOLUTE_MIN_STUDENTS);
        }

        private async Task CancelSectionAsync(AppDbContext context, Models.Section section, string reason)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Đánh dấu section bị hủy
                section.IsCancelled = true;
                section.CancelledAt = DateTime.UtcNow;
                section.CancellationReason = reason;
                section.Status = SectionStatus.IsClosed;

                // Hủy tất cả enrollments và chuyển sang trạng thái Dropped
                var enrollments = await context.Enrollments
                    .Where(e => e.Section.SectionId == section.SectionId && 
                               e.enrollmentStatus == EnrollmentStatus.Enrolled)
                    .ToListAsync();

                foreach (var enrollment in enrollments)
                {
                    enrollment.enrollmentStatus = EnrollmentStatus.Dropped;
                }

                // Hủy tất cả practice group enrollments của section này
                var practiceGroupEnrollments = await context.PracticeGroupEnrollments
                    .Include(pge => pge.PracticeGroup)
                    .Where(pge => pge.PracticeGroup.SectionId == section.SectionId && pge.IsActive)
                    .ToListAsync();

                foreach (var pge in practiceGroupEnrollments)
                {
                    pge.IsActive = false;
                    
                    // Giảm số lượng trong practice group
                    var practiceGroup = await context.PracticeGroups
                        .FirstOrDefaultAsync(pg => pg.PracticeGroupId == pge.PracticeGroupId);
                    if (practiceGroup != null)
                    {
                        practiceGroup.CurrentCount = Math.Max(0, practiceGroup.CurrentCount - 1);
                        context.PracticeGroups.Update(practiceGroup);
                    }
                }

                // Đánh dấu tất cả practice groups của section này là inactive
                var practiceGroups = await context.PracticeGroups
                    .Where(pg => pg.SectionId == section.SectionId && pg.IsActive)
                    .ToListAsync();

                foreach (var pg in practiceGroups)
                {
                    pg.IsActive = false;
                }

                // Cập nhật section enrollment count
                section.EnrolledCount = 0;

                // Lưu các thay đổi
                context.Sections.Update(section);
                context.Enrollments.UpdateRange(enrollments);
                context.PracticeGroupEnrollments.UpdateRange(practiceGroupEnrollments);
                context.PracticeGroups.UpdateRange(practiceGroups);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogWarning(
                    "Section {SectionCode} (ID: {SectionId}) cancelled successfully: {Reason}. Affected {EnrollmentCount} enrollments",
                    section.SectionCode ?? $"LHP{section.SectionId}",
                    section.SectionId,
                    reason,
                    enrollments.Count);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, 
                    "Failed to cancel section {SectionId}: {ErrorMessage}",
                    section.SectionId, ex.Message);
                throw;
            }
        }
    }
}