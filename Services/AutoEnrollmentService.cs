using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;

namespace StudentManagement.Services
{
    public class AutoEnrollmentService
    {
        private readonly AppDbContext _context;

        public AutoEnrollmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AutoEnrollmentResult> AutoEnrollFirstYearStudentsAsync(int semesterId)
        {
            var result = new AutoEnrollmentResult();
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Lấy tất cả sinh viên năm 1 (đang active)
                var firstYearStudents = await _context.Students
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                    .Where(s => (DateTime.Now.Year - s.YearOfAdmission + 1) == 1
                             && s.StudentStatus == StudentStatus.Active)
                    .ToListAsync();

                if (!firstYearStudents.Any())
                {
                    result.Message = "Không tìm thấy sinh viên năm 1 nào";
                    return result;
                }

                // Lấy tất cả sections của học kỳ cho môn năm 1
                var availableSections = await _context.Sections
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Program)
                    .Include(s => s.Class)
                    .Where(s => s.Semester.SemesterId == semesterId &&
                               s.CurriculumCourse.SemeterSuggested == 1 && // Môn năm 1
                               s.Status == SectionStatus.IsOpening &&
                               !s.IsCancelled)
                    .ToListAsync();

                foreach (var student in firstYearStudents)
                {
                    // Tìm sections phù hợp với chương trình của sinh viên
                    var studentSections = availableSections
                        .Where(s => s.CurriculumCourse.Program.AcademicProgramId == student.Class.Program.AcademicProgramId
                                && s.Class.ClassId == student.Class.ClassId)
                        .ToList();

                    foreach (var section in studentSections)
                    {
                        // Kiểm tra đã đăng ký chưa
                        var existingEnrollment = await _context.Enrollments
                            .AnyAsync(e => e.Student.Id == student.Id && 
                                          e.Section.SectionId == section.SectionId);

                        if (!existingEnrollment && section.EnrolledCount < section.Capacity)
                        {
                            // Tạo enrollment mới
                            var enrollment = new Enrollment
                            {
                                Student = student,
                                Section = section,
                                enrollmentStatus = EnrollmentStatus.Enrolled,
                                RegisteredAt = DateTime.Now
                            };

                            _context.Enrollments.Add(enrollment);
                            
                            // Cập nhật số lượng đăng ký
                            section.EnrolledCount++;
                            
                            result.SuccessCount++;
                            result.EnrolledCourses.Add($"{student.MSSV} -> {section.CurriculumCourse.Course.CourseName}");

                            // **MỚI: Tự động đăng ký nhóm thực hành nếu môn có thực hành**
                            if (section.CurriculumCourse.Course.CreditsLab > 0)
                            {
                                var practiceGroupResult = await AutoAssignToPracticeGroupAsync(student.Id, section.SectionId);
                                
                                if (practiceGroupResult.Success)
                                {
                                    result.EnrolledCourses.Add($"  └─ {student.MSSV} -> Nhóm TH: {practiceGroupResult.GroupName}");
                                }
                                else
                                {
                                    result.ErrorMessages.Add($"{student.MSSV}: Không thể phân nhóm TH - {practiceGroupResult.Message}");
                                }
                            }
                        }
                        else if (section.EnrolledCount >= section.Capacity)
                        {
                            result.FailedCount++;
                            result.ErrorMessages.Add($"{student.MSSV}: Lớp {section.CurriculumCourse.Course.CourseName} đã đầy");
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                result.IsSuccess = true;
                result.Message = $"Đăng ký thành công {result.SuccessCount} môn, thất bại {result.FailedCount} môn";
                
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                result.IsSuccess = false;
                result.Message = $"Lỗi: {ex.Message}";
                return result;
            }
        }

        // **MỚI: Method tự động phân nhóm thực hành**
        private async Task<(bool Success, string GroupName, string Message)> AutoAssignToPracticeGroupAsync(int studentId, int sectionId)
        {
            try
            {
                // Kiểm tra sinh viên đã có nhóm thực hành cho section này chưa
                var existingPracticeGroup = await _context.PracticeGroupEnrollments
                    .Include(pge => pge.PracticeGroup)
                    .FirstOrDefaultAsync(pge => pge.StudentId == studentId &&
                                              pge.PracticeGroup.SectionId == sectionId &&
                                              pge.IsActive);

                if (existingPracticeGroup != null)
                {
                    return (true, existingPracticeGroup.PracticeGroup.GroupName, "Đã có nhóm thực hành");
                }

                // Lấy tất cả nhóm thực hành của section, sắp xếp theo thứ tự ưu tiên
                var availablePracticeGroups = await _context.PracticeGroups
                    .Include(s => s.Section)
                       .ThenInclude(s => s.Semester)
                    .Where(pg => pg.SectionId == sectionId && 
                                pg.IsActive && 
                                pg.CurrentCount < pg.MaxCapacity)
                    .OrderBy(pg => pg.CurrentCount) // Ưu tiên nhóm ít người nhất
                    .ThenBy(pg => pg.PracticeGroupId) // Sau đó theo ID (nhóm tạo trước)
                    .ToListAsync();

                if (!availablePracticeGroups.Any())
                {
                    return (false, "", "Không có nhóm thực hành nào còn chỗ trống");
                }

                // Chọn nhóm có ít người nhất
                var selectedGroup = availablePracticeGroups.First();

                // **KIỂM TRA XUNG ĐỘT LỊCH THỰC HÀNH**
                var conflictErrors = await CheckPracticeGroupScheduleConflictsAsync(studentId, selectedGroup);
                
                if (conflictErrors.Any())
                {
                    // Nếu nhóm đầu tiên bị xung đột, thử các nhóm khác
                    foreach (var alternativeGroup in availablePracticeGroups.Skip(1))
                    {
                        var altConflicts = await CheckPracticeGroupScheduleConflictsAsync(studentId, alternativeGroup);
                        if (!altConflicts.Any())
                        {
                            selectedGroup = alternativeGroup;
                            conflictErrors.Clear();
                            break;
                        }
                    }

                    // Nếu tất cả nhóm đều xung đột
                    if (conflictErrors.Any())
                    {
                        return (false, "", $"Tất cả nhóm thực hành đều xung đột lịch: {string.Join(", ", conflictErrors)}");
                    }
                }

                // Tạo enrollment vào nhóm thực hành
                var practiceGroupEnrollment = new PracticeGroupEnrollment
                {
                    PracticeGroupId = selectedGroup.PracticeGroupId,
                    StudentId = studentId,
                    EnrolledAt = DateTime.Now,
                    IsActive = true
                };

                _context.PracticeGroupEnrollments.Add(practiceGroupEnrollment);
                
                // Cập nhật số lượng sinh viên trong nhóm
                selectedGroup.CurrentCount++;
                _context.PracticeGroups.Update(selectedGroup);

                return (true, selectedGroup.GroupName, "Đăng ký nhóm thực hành thành công");
            }
            catch (Exception ex)
            {
                return (false, "", $"Lỗi khi phân nhóm thực hành: {ex.Message}");
            }
        }

        // **MỚI: Kiểm tra xung đột lịch thực hành cho sinh viên**
        private async Task<List<string>> CheckPracticeGroupScheduleConflictsAsync(int studentId, PracticeGroup practiceGroup)
        {
            var errors = new List<string>();

            // Lấy lịch của nhóm thực hành
            var practiceSchedules = await _context.Schedules
                .Where(s => s.PracticeGroupId == practiceGroup.PracticeGroupId)
                .ToListAsync();

            if (!practiceSchedules.Any())
            {
                return errors; // Không có lịch thì không xung đột
            }

            // Lấy tất cả lịch học của sinh viên trong cùng semester
            var studentSchedules = await GetAllStudentSchedulesInSemesterAsync(studentId, practiceGroup.Section.Semester.SemesterId);

            // Kiểm tra xung đột
            foreach (var practiceSchedule in practiceSchedules)
            {
                foreach (var existingSchedule in studentSchedules)
                {
                    if (practiceSchedule.DayOfWeek == existingSchedule.DayOfWeek &&
                        practiceSchedule.DayOfWeek.HasValue &&
                        DoTimesOverlap(practiceSchedule.StartTime, practiceSchedule.EndTime,
                                     existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        var dayText = GetDayOfWeekInVietnamese(practiceSchedule.DayOfWeek.Value);
                        errors.Add($"Trùng lịch {dayText} {practiceSchedule.StartTime:HH:mm}-{practiceSchedule.EndTime:HH:mm}");
                    }
                }
            }

            return errors;
        }

        // **Helper: Lấy tất cả lịch học của sinh viên trong semester**
        private async Task<List<Schedule>> GetAllStudentSchedulesInSemesterAsync(int studentId, int semesterId)
        {
            // Lấy lịch lý thuyết
            var theorySchedules = await _context.Enrollments
                .Where(e => e.Student.Id == studentId && 
                           e.Section.Semester.SemesterId == semesterId &&
                           e.enrollmentStatus == EnrollmentStatus.Enrolled)
                .SelectMany(e => e.Section.Schedules)
                .Where(s => !s.PracticeGroupId.HasValue && s.ScheduleType.ScheduleTypeId != 3)
                .ToListAsync();

            // Lấy lịch thực hành hiện tại
            var practiceSchedules = await _context.PracticeGroupEnrollments
                .Where(pge => pge.StudentId == studentId && 
                             pge.IsActive &&
                             pge.PracticeGroup.Section.Semester.SemesterId == semesterId)
                .SelectMany(pge => pge.PracticeGroup.Schedules)
                .Where(s => s.ScheduleType.ScheduleTypeId != 3)
                .ToListAsync();

            return theorySchedules.Concat(practiceSchedules).ToList();
        }

        // **Helper methods**
        private bool DoTimesOverlap(TimeOnly start1, TimeOnly end1, TimeOnly start2, TimeOnly end2)
        {
            return start1 < end2 && start2 < end1;
        }

        private string GetDayOfWeekInVietnamese(DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
            {
                DayOfWeek.Monday => "Thứ 2",
                DayOfWeek.Tuesday => "Thứ 3",
                DayOfWeek.Wednesday => "Thứ 4",
                DayOfWeek.Thursday => "Thứ 5",
                DayOfWeek.Friday => "Thứ 6",
                DayOfWeek.Saturday => "Thứ 7",
                DayOfWeek.Sunday => "Chủ nhật",
                _ => ""
            };
        }
    }

    public class AutoEnrollmentResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = "";
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public List<string> EnrolledCourses { get; set; } = new();
        public List<string> ErrorMessages { get; set; } = new();
    }
}