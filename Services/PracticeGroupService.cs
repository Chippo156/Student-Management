using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using static System.Collections.Specialized.BitVector32;

namespace StudentManagement.Services
{
    public class PracticeGroupService(AppDbContext context) : IPracticeGroupService
    {
        public async Task<PracticeGroup> CreatePracticeGroupAsync(PracticeGroupRequest request)
        {
            var section = await context.Sections
                .Include(s => s.Lecturer)
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .FirstOrDefaultAsync(s => s.SectionId == request.SectionId);

            if (section == null)
            {
                throw new Exception("Không tìm thấy lớp học phần");
            }

            // Kiểm tra xem môn học có tín chỉ thực hành không
            if (section.CurriculumCourse.Course.CreditsLab <= 0)
            {
                throw new Exception("Môn học này không có tín chỉ thực hành");
            }

            // Kiểm tra trùng tên nhóm trong cùng section
            var existingGroup = await context.PracticeGroups
                .FirstOrDefaultAsync(pg => pg.SectionId == request.SectionId && 
                                          pg.GroupName == request.GroupName &&
                                          pg.IsActive);

            if (existingGroup != null)
            {
                throw new Exception("Nhóm thực hành có tên này đã tồn tại trong phần này");
            }

            var practiceGroup = new PracticeGroup
            {
                GroupName = request.GroupName,
                Description = request.Description,
                MaxCapacity = request.MaxCapacity,
                SectionId = request.SectionId,
                Section = section
            };

            if (request.LecturerId != null)
            {
                var lecturer = await context.Lecturers.FindAsync(request.LecturerId);
                if (lecturer == null)
                {
                    throw new Exception("Giảng viên không tồn tại");
                }
                practiceGroup.LecturerId = request.LecturerId;
                practiceGroup.Lecturer = lecturer;
            } else
            {
                var lecturer = section.Lecturer;
                if (lecturer != null)
                {
                    practiceGroup.LecturerId = lecturer.Id;
                    practiceGroup.Lecturer = lecturer;
                }
            }

                PracticeScheduleRequest practiceScheduleRequest = new PracticeScheduleRequest
                {
                    PracticeGroupId = practiceGroup.PracticeGroupId,
                    ScheduleTypeId = request.ScheduleTypeId,
                    DayOfWeek = request.DayOfWeek,
                    Date = request.Date,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Room = request.Room,
                    OnlineLink = request.OnlineLink
                };

            await AddPracticeScheduleAsync(practiceScheduleRequest, practiceGroup);
            return practiceGroup;
        }

        public async Task<PracticeGroupResponse?> GetPracticeGroupByIdAsync(int practiceGroupId)
        {
            var practiceGroup = await context.PracticeGroups
                .Include(pg => pg.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(pg => pg.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .Include(pg => pg.PracticeGroupEnrollments)
                    .ThenInclude(pge => pge.Student)
                        .ThenInclude(s => s.Class)
                .FirstOrDefaultAsync(pg => pg.PracticeGroupId == practiceGroupId && pg.IsActive);

            if (practiceGroup == null)
                return null;

            return MapToPracticeGroupResponse(practiceGroup);
        }

        public async Task<IEnumerable<PracticeGroupResponse>> GetPracticeGroupsBySectionAsync(int sectionId)
        {
            var practiceGroups = await context.PracticeGroups
                .Include(pg => pg.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(pg => pg.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .Include(pg => pg.PracticeGroupEnrollments)
                    .ThenInclude(pge => pge.Student)
                        .ThenInclude(s => s.Class)
                .Include(pg => pg.PracticeGroupEnrollments)
                    .ThenInclude(pge => pge.Student)
                       .ThenInclude(s => s.User)


                .Where(pg => pg.SectionId == sectionId && pg.IsActive)
                .ToListAsync();

            return practiceGroups.Select(MapToPracticeGroupResponse);
        }

        public async Task<bool> EnrollStudentInPracticeGroupAsync(int practiceGroupId, int studentId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                var practiceGroup = await context.PracticeGroups
                    .Include(pg => pg.PracticeGroupEnrollments)
                    .FirstOrDefaultAsync(pg => pg.PracticeGroupId == practiceGroupId && pg.IsActive);

                if (practiceGroup == null)
                {
                    throw new Exception("Practice group not found");
                }

                var student = await context.Students
                    .FirstOrDefaultAsync(s => s.Id == studentId);

                if (student == null)
                {
                    throw new Exception("Student not found");
                }

                // Kiểm tra sinh viên đã đăng ký section này chưa
                var enrollment = await context.Enrollments
                    .FirstOrDefaultAsync(e => e.Student.Id == studentId && 
                                            e.Section.SectionId == practiceGroup.SectionId);

                if (enrollment == null)
                {
                    throw new Exception("Student is not enrolled in this section");
                }

                // Kiểm tra nhóm đã đầy chưa
                if (practiceGroup.CurrentCount >= practiceGroup.MaxCapacity)
                {
                    throw new Exception("Practice group is full");
                }

                // Kiểm tra sinh viên đã có nhóm thực hành cho section này chưa
                var existingGroupEnrollment = await context.PracticeGroupEnrollments
                    .Include(pge => pge.PracticeGroup)
                    .FirstOrDefaultAsync(pge => pge.Student.Id == studentId && 
                                              pge.PracticeGroup.SectionId == practiceGroup.SectionId &&
                                              pge.IsActive);

                if (existingGroupEnrollment != null)
                {
                    throw new Exception("Student is already assigned to a practice group for this section");
                }

                // Tạo enrollment mới
                var practiceGroupEnrollment = new PracticeGroupEnrollment
                {
                    PracticeGroupId = practiceGroupId,
                    PracticeGroup = practiceGroup,
                    StudentId = studentId,
                    Student = student
                };

                context.PracticeGroupEnrollments.Add(practiceGroupEnrollment);
                
                // Cập nhật số lượng sinh viên hiện tại
                practiceGroup.CurrentCount++;
                context.PracticeGroups.Update(practiceGroup);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Schedule> AddPracticeScheduleAsync(PracticeScheduleRequest request, PracticeGroup practiceGroup)
        {
            //var practiceGroup = await context.PracticeGroups
            //    .Include(pg => pg.Section)
            //    .FirstOrDefaultAsync(pg => pg.PracticeGroupId == request.PracticeGroupId && pg.IsActive);

            if (practiceGroup == null)
            {
                throw new Exception("Không tìm thấy nhóm thực hành");
            }

            var scheduleType = await context.ScheduleTypes.FindAsync(request.ScheduleTypeId);
            if (scheduleType == null)
            {
                throw new Exception("Không tìm thấy loại lịch");
            }

            // Kiểm tra xung đột lịch (có thể sử dụng lại logic từ ScheduleService)
            var hasConflicts = await CheckPracticeScheduleConflictsAsync(
                practiceGroup.SectionId,
                request.PracticeGroupId,
                request.Date,
                request.DayOfWeek,
                request.StartTime,
                request.EndTime,
                request.Room);

            if (hasConflicts)
            {
                throw new Exception("Xung đột lịch với lịch hiện có");
            }
            context.PracticeGroups.Add(practiceGroup);
            await context.SaveChangesAsync();

            var schedule = new Schedule
            {
                Section = practiceGroup.Section,
                PracticeGroupId = request.PracticeGroupId,
                PracticeGroup = practiceGroup,
                ScheduleType = scheduleType,
                DayOfWeek = request.DayOfWeek,
                Date = request.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Room = request.Room,
                OnlineLink = request.OnlineLink
            };



            context.Schedules.Add(schedule);
            await context.SaveChangesAsync();

            return schedule;
        }

        public async Task<IEnumerable<PracticeGroupResponse>> GetAvailablePracticeGroupsAsync(int sectionId)
        {
            var practiceGroups = await context.PracticeGroups
                .Include(pg => pg.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(pg => pg.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .Include(pg => pg.PracticeGroupEnrollments)
                    .ThenInclude(pge => pge.Student)
                        .ThenInclude(s => s.Class)
                .Where(pg => pg.SectionId == sectionId && 
                           pg.IsActive && 
                           pg.CurrentCount < pg.MaxCapacity)
                .ToListAsync();

            return practiceGroups.Select(MapToPracticeGroupResponse);
        }

        public async Task<bool> AutoAssignStudentsToPracticeGroupsAsync(int sectionId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Lấy danh sách sinh viên đã đăng ký section nhưng chưa có nhóm thực hành
                var studentsWithoutGroup = await context.Enrollments
                    .Include(e => e.Student)
                    .Where(e => e.Section.SectionId == sectionId)
                    .Where(e => !context.PracticeGroupEnrollments
                        .Any(pge => pge.Student.Id == e.Student.Id && 
                                   pge.PracticeGroup.SectionId == sectionId &&
                                   pge.IsActive))
                    .Select(e => e.Student)
                    .ToListAsync();

                // Lấy danh sách nhóm thực hành còn chỗ trống
                var availableGroups = await context.PracticeGroups
                    .Where(pg => pg.SectionId == sectionId && 
                               pg.IsActive && 
                               pg.CurrentCount < pg.MaxCapacity)
                    .OrderBy(pg => pg.PracticeGroupId)
                    .ToListAsync();

                if (!availableGroups.Any())
                {
                    throw new Exception("No available practice groups");
                }

                int currentGroupIndex = 0;
                foreach (var student in studentsWithoutGroup)
                {
                    // Tìm nhóm có chỗ trống
                    while (currentGroupIndex < availableGroups.Count && 
                           availableGroups[currentGroupIndex].CurrentCount >= availableGroups[currentGroupIndex].MaxCapacity)
                    {
                        currentGroupIndex++;
                    }

                    if (currentGroupIndex >= availableGroups.Count)
                    {
                        break; // Hết chỗ trong tất cả nhóm
                    }

                    var group = availableGroups[currentGroupIndex];
                    
                    var practiceGroupEnrollment = new PracticeGroupEnrollment
                    {
                        PracticeGroupId = group.PracticeGroupId,
                        StudentId = student.Id
                    };

                    context.PracticeGroupEnrollments.Add(practiceGroupEnrollment);
                    group.CurrentCount++;

                    // Chuyển sang nhóm tiếp theo nếu nhóm hiện tại đã đầy
                    if (group.CurrentCount >= group.MaxCapacity)
                    {
                        currentGroupIndex++;
                    }
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Helper methods
        // Helper methods
        private async Task<bool> CheckPracticeScheduleConflictsAsync(int sectionId, int practiceGroupId, DateOnly? dateEvent, DayOfWeek? dayOfWeek, TimeOnly startTime, TimeOnly endTime, string room)
        {
            // 1. Lấy SemesterId của Section hiện tại
            var currentSection = await context.Sections
                .Include(s => s.Semester)
                .Where(s => s.SectionId == sectionId)
                .Select(s => new { s.Semester.SemesterId }) // Chỉ lấy trường cần thiết
                .FirstOrDefaultAsync();

            if (currentSection == null)
            {
                return false;
            }

            var query = context.Schedules
                .Include(s => s.Section)
             .Where(s =>
              s.Section.SectionId == sectionId &&
              s.DayOfWeek == dayOfWeek &&
              s.Room == room &&
             ((s.StartTime <= startTime && s.EndTime > startTime) ||
                             (s.StartTime < endTime && s.EndTime >= endTime) ||
                             (s.StartTime >= startTime && s.EndTime <= endTime))
             );

            bool hasConflict = await query.AnyAsync();

            if (hasConflict)
            {
                return true;
            }
            var targetSemesterId = currentSection.SemesterId;

            // 2. Check conflict với lịch lý thuyết (main schedules) trong cùng Semester
            var mainScheduleConflicts = await context.Schedules
                .Include(s => s.Section) // Cần Include bảng Section để truy cập SemesterId
                  .ThenInclude(s => s.Semester)
                .Where(s => s.Section.Semester.SemesterId == targetSemesterId && // <--- CHỈ CHECK TRONG CÙNG SEMESTER
                            s.DayOfWeek == dayOfWeek &&
                            s.Date == dateEvent &&
                            s.Room == room &&
                            !s.PracticeGroupId.HasValue && // Lịch lý thuyết (không phải lịch thực hành)
                            s.ScheduleType.ScheduleTypeId != 3 && // Không phải lịch thi
                            ((s.StartTime <= startTime && s.EndTime > startTime) ||
                             (s.StartTime < endTime && s.EndTime >= endTime) ||
                             (s.StartTime >= startTime && s.EndTime <= endTime)))
                .AnyAsync();

            if (mainScheduleConflicts)
            {
                return true; // Conflict với lịch lý thuyết
            }

            // 3. Check conflict với các lịch thực hành khác (practice group schedules) trong cùng Semester
            var practiceScheduleConflicts = await context.Schedules
                .Include(s => s.Section) // Cần Include bảng Section để truy cập SemesterId
                  .ThenInclude(s => s.Semester)
                .Where(s => s.Section.Semester.SemesterId == targetSemesterId && // <--- CHỈ CHECK TRONG CÙNG SEMESTER
                            s.DayOfWeek == dayOfWeek &&
                            s.Date == dateEvent &&
                            s.Room == room &&
                            s.PracticeGroupId.HasValue && // Lịch thực hành
                            s.PracticeGroupId != practiceGroupId && // Tránh conflict với chính nó (nếu update) & các nhóm khác
                            s.ScheduleType.ScheduleTypeId != 3 && // Không phải lịch thi
                            ((s.StartTime <= startTime && s.EndTime > startTime) ||
                             (s.StartTime < endTime && s.EndTime >= endTime) ||
                             (s.StartTime >= startTime && s.EndTime <= endTime)))
                .AnyAsync();

            if (practiceScheduleConflicts)
            {
                return true; // Conflict với lịch thực hành khác
            }

            // 4. Check conflict với lịch thi trong cùng Semester (nếu có date cụ thể)
            if (dateEvent.HasValue)
            {
                var examScheduleConflicts = await context.Schedules
                    .Include(s => s.Section)
                      .ThenInclude(s => s.Semester)
                    .Where(s => s.Section.Semester.SemesterId == targetSemesterId &&
                                s.Date == dateEvent &&
                                s.Room == room &&
                                s.ScheduleType.ScheduleTypeId == 3 && // Lịch thi
                                ((s.StartTime <= startTime && s.EndTime > startTime) ||
                                 (s.StartTime < endTime && s.EndTime >= endTime) ||
                                 (s.StartTime >= startTime && s.EndTime <= endTime)))
                    .AnyAsync();

                if (examScheduleConflicts)
                {
                    return true; // Conflict với lịch thi
                }
            }

            return false; // Không có conflict
        }

        private static PracticeGroupResponse MapToPracticeGroupResponse(PracticeGroup practiceGroup)
        {
            return new PracticeGroupResponse
            {
                PracticeGroupId = practiceGroup.PracticeGroupId,
                GroupName = practiceGroup.GroupName,
                Description = practiceGroup.Description,
                MaxCapacity = practiceGroup.MaxCapacity,
                CurrentCount = practiceGroup.CurrentCount,
                IsActive = practiceGroup.IsActive,
                SectionId = practiceGroup.SectionId,
                SectionCode = practiceGroup.Section.SectionCode ?? $"SEC{practiceGroup.SectionId}",
                CourseCode = practiceGroup.Section.CurriculumCourse.Course.CourseCode,
                CourseName = practiceGroup.Section.CurriculumCourse.Course.CourseName,
                CreatedAt = practiceGroup.CreatedAt,
                Schedules = practiceGroup.Schedules.Select(sch => new PracticeScheduleInfo
                {
                    ScheduleId = sch.ScheduleId,
                    DayOfWeek = GetDayOfWeekInVietnamese(sch.DayOfWeek),
                    Date = sch.Date,
                    TimeSlot = $"{sch.StartTime:HH:mm} - {sch.EndTime:HH:mm}",
                    Room = sch.Room,
                }).ToList(),
                Students = practiceGroup.PracticeGroupEnrollments
                    .Where(pge => pge.IsActive)
                    .Select(pge => new StudentInfo
                    {
                        StudentId = pge.Student.Id,
                        MSSV = pge.Student.MSSV,
                        FullName = pge.Student.User.FullName,
                        ClassName = pge.Student.Class.ClassName,
                        EnrolledAt = pge.EnrolledAt
                    }).ToList()
            };
        }

        private static string GetDayOfWeekInVietnamese(DayOfWeek? dayOfWeek)
        {
            if (!dayOfWeek.HasValue) return "";

            return dayOfWeek.Value switch
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

        // Implement remaining interface methods...
        public async Task<PracticeGroup?> UpdatePracticeGroupAsync(int practiceGroupId, PracticeGroupRequest request)
        {
            var practiceGroup = await context.PracticeGroups.FindAsync(practiceGroupId);
            if (practiceGroup == null || !practiceGroup.IsActive)
                return null;

            practiceGroup.GroupName = request.GroupName;
            practiceGroup.Description = request.Description;
            practiceGroup.MaxCapacity = request.MaxCapacity;

            if (request.LecturerId != null)
            {
                var lecturer = await context.Lecturers.FindAsync(request.LecturerId);
                if (lecturer == null)
                {
                    throw new Exception("Giảng viên không tồn tại");
                }
                practiceGroup.LecturerId = request.LecturerId;
                practiceGroup.Lecturer = lecturer;
            }

            context.PracticeGroups.Update(practiceGroup);
            await context.SaveChangesAsync();

            return practiceGroup;
        }

        public async Task<bool> DeletePracticeGroupAsync(int practiceGroupId)
        {
            var practiceGroup = await context.PracticeGroups.FindAsync(practiceGroupId);
            if (practiceGroup == null)
                return false;

            practiceGroup.IsActive = false;
            context.PracticeGroups.Update(practiceGroup);
            
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveStudentFromPracticeGroupAsync(int practiceGroupId, int studentId)
        {
            var enrollment = await context.PracticeGroupEnrollments
                .Include(pge => pge.PracticeGroup)
                .FirstOrDefaultAsync(pge => pge.PracticeGroupId == practiceGroupId && 
                                          pge.StudentId == studentId && 
                                          pge.IsActive);

            if (enrollment == null)
                return false;

            enrollment.IsActive = false;
            enrollment.PracticeGroup.CurrentCount = Math.Max(0, enrollment.PracticeGroup.CurrentCount - 1);
            
            context.PracticeGroupEnrollments.Update(enrollment);
            context.PracticeGroups.Update(enrollment.PracticeGroup);

            return await context.SaveChangesAsync() > 0;
        }

        public async Task<PracticeGroupResponse?> GetStudentPracticeGroupAsync(int studentId, int sectionId)
        {
            var practiceGroup = await context.PracticeGroups
                .Include(pg => pg.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(pg => pg.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .Include(pg => pg.PracticeGroupEnrollments)
                    .ThenInclude(pge => pge.Student)
                        .ThenInclude(s => s.Class)
                .FirstOrDefaultAsync(pg => pg.SectionId == sectionId &&
                                          pg.PracticeGroupEnrollments.Any(pge => pge.StudentId == studentId && pge.IsActive) &&
                                          pg.IsActive);

            return practiceGroup != null ? MapToPracticeGroupResponse(practiceGroup) : null;
        }

        public async Task<bool> RemovePracticeScheduleAsync(int scheduleId)
        {
            var schedule = await context.Schedules.FindAsync(scheduleId);
            if (schedule == null)
                return false;

            context.Schedules.Remove(schedule);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Schedule>> GetPracticeGroupSchedulesAsync(int practiceGroupId)
        {
            return await context.Schedules
                .Include(s => s.ScheduleType)
                .Include(s => s.Section)
                .Where(s => s.PracticeGroupId == practiceGroupId)
                .ToListAsync();
        }

        public async Task<bool> AssignLecturerToPracticeGroupAsync(int practiceGroupId, int lecturerId)
        {
            var practiceGroup = await context.PracticeGroups
                .Include(pg => pg.Section)
                .FirstOrDefaultAsync(pg => pg.PracticeGroupId == practiceGroupId && pg.IsActive);
            if (practiceGroup == null)
            {
                throw new Exception("Practice group not found");
            }
            var lecturer = await context.Lecturers.FindAsync(lecturerId);
            if (lecturer == null)
            {
                throw new Exception("Lecturer not found");
            }
            practiceGroup.Lecturer = lecturer;
            context.PracticeGroups.Update(practiceGroup);
            await context.SaveChangesAsync();
            return true;
        }
    }
}