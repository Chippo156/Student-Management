using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AttendanceService(AppDbContext context) : IAttendanceService
    {
        public async Task<AttendanceSession> CreateAttendanceSessionAsync(CreateAttendanceSessionRequest request, string lecturerCode)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Get lecturer information
                var lecturer = await context.Lecturers
                    .Include(l => l.User)
                    .FirstOrDefaultAsync(l => l.User.Username == lecturerCode)
                    ?? throw new Exception("Không tìm thấy giảng viên");

                // Get section information
                var section = await context.Sections
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                    .Include(s => s.Lecturer)
                    .FirstOrDefaultAsync(s => s.SectionId == request.SectionId)
                    ?? throw new Exception("Không tìm thấy học phần");

                // Verify lecturer owns this section or practice group
                if (request.PracticeGroupId.HasValue)
                {
                    var practiceGroup = await context.PracticeGroups
                        .FirstOrDefaultAsync(pg => pg.PracticeGroupId == request.PracticeGroupId.Value && 
                                                  pg.LecturerId == lecturer.Id)
                        ?? throw new Exception("Nhóm thực hành không tìm thấy hoặc bạn không có quyền");
                }
                else
                {
                    if (section.Lecturer.Id != lecturer.Id)
                    {
                        throw new Exception("Bạn không có quyền tạo điểm danh cho phần này");
                    }
                }

                // Create attendance session
                var attendanceSession = new AttendanceSession
                {
                    SectionId = request.SectionId,
                    Section = section,
                    SessionDate = request.SessionDate,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    SessionName = request.SessionName,
                    Description = request.Description,
                    Room = request.Room,
                    CreatedByLecturerId = lecturer.Id,
                    CreatedByLecturer = lecturer,
                    PracticeGroupId = request.PracticeGroupId,
                    AllowSelfCheckIn = request.AllowSelfCheckIn,
                    SelfCheckInStartTime = request.SelfCheckInStartTime,
                    SelfCheckInEndTime = request.SelfCheckInEndTime,
                    CheckInCode = request.CheckInCode
                };

                context.AttendanceSessions.Add(attendanceSession);
                await context.SaveChangesAsync();

                // Auto-create attendance records for all enrolled students
                await CreateInitialAttendanceRecordsAsync(attendanceSession, request.PracticeGroupId);

                await transaction.CommitAsync();
                return attendanceSession;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<AttendanceSessionResponse> RecordAttendanceAsync(RecordAttendanceRequest request, string lecturerCode)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Get lecturer information
                var lecturer = await context.Lecturers
                    .Include(l => l.User)
                    .FirstOrDefaultAsync(l => l.User.Username == lecturerCode)
                    ?? throw new Exception("Không tìm thấy giảng viên");

                // Get attendance session
                var attendanceSession = await context.AttendanceSessions
                    .Include(a => a.Section)
                    .Include(a => a.PracticeGroup)
                    .FirstOrDefaultAsync(a => a.AttendanceSessionId == request.AttendanceSessionId)
                    ?? throw new Exception("Không tìm thấy phiên diểm danh");

                // Verify permission
                var hasPermission = attendanceSession.CreatedByLecturerId == lecturer.Id ||
                                   attendanceSession.Section.Lecturer.Id == lecturer.Id ||
                                   (attendanceSession.PracticeGroupId.HasValue && 
                                    attendanceSession.PracticeGroup?.LecturerId == lecturer.Id);

                if (!hasPermission)
                {
                    throw new Exception("Bạn không có quyền ghi lại sự tham dự cho phiên này");
                }

                // Update attendance records
                foreach (var studentRecord in request.StudentAttendances)
                {
                    var attendance = await context.Attendances
                        .FirstOrDefaultAsync(a => a.AttendanceSessionId == request.AttendanceSessionId &&
                                                 a.StudentId == studentRecord.StudentId);

                    if (attendance != null)
                    {
                        attendance.Status = studentRecord.Status;
                        attendance.Note = studentRecord.Note;
                        attendance.RecordedAt = DateTime.Now;
                        attendance.RecordedByLecturerId = lecturer.Id;
                        context.Attendances.Update(attendance);
                    }
                    else
                    {
                        // Create new attendance record if it doesn't exist
                        attendance = new Attendance
                        {
                            AttendanceSessionId = request.AttendanceSessionId,
                            StudentId = studentRecord.StudentId,
                            SectionId = attendanceSession.SectionId,
                            Status = studentRecord.Status,
                            Note = studentRecord.Note,
                            RecordedByLecturerId = lecturer.Id
                        };
                        context.Attendances.Add(attendance);
                    }
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Return updated session with statistics
                return await GetAttendanceSessionByIdAsync(request.AttendanceSessionId);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<AttendanceSessionResponse> GetAttendanceSessionByIdAsync(int attendanceSessionId)
        {
            var attendanceSession = await context.AttendanceSessions
                .Include(a => a.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(a => a.CreatedByLecturer)
                    .ThenInclude(l => l.User)
                .Include(a => a.PracticeGroup)
                .Include(a => a.Attendances)
                    .ThenInclude(att => att.Student)
                        .ThenInclude(s => s.User)
                .Include(a => a.Attendances)
                    .ThenInclude(att => att.Student)
                        .ThenInclude(s => s.Class)
                .Include(a => a.Attendances)
                    .ThenInclude(att => att.RecordedByLecturer)
                        .ThenInclude(l => l.User)
                .FirstOrDefaultAsync(a => a.AttendanceSessionId == attendanceSessionId)
                ?? throw new Exception("Attendance session not found");

            // Calculate statistics
            var attendances = attendanceSession.Attendances.ToList();
            var totalStudents = attendances.Count;
            var presentCount = attendances.Count(a => a.Status == AttendanceStatus.Present);
            var absentCount = attendances.Count(a => a.Status == AttendanceStatus.Absent);
            var lateCount = attendances.Count(a => a.Status == AttendanceStatus.Late);
            var excusedCount = attendances.Count(a => a.Status == AttendanceStatus.Excused);
            var attendanceRate = totalStudents > 0 ? Math.Round((double)presentCount / totalStudents * 100, 2) : 0;

            var response = new AttendanceSessionResponse
            {
                AttendanceSessionId = attendanceSession.AttendanceSessionId,
                SectionId = attendanceSession.SectionId,
                SectionCode = attendanceSession.Section.SectionCode ?? $"LHP{attendanceSession.SectionId}",
                CourseName = attendanceSession.Section.CurriculumCourse.Course.CourseName,
                SessionDate = attendanceSession.SessionDate,
                StartTime = attendanceSession.StartTime,
                EndTime = attendanceSession.EndTime,
                SessionName = attendanceSession.SessionName,
                Description = attendanceSession.Description,
                Room = attendanceSession.Room,
                IsActive = attendanceSession.IsActive,
                CreatedAt = attendanceSession.CreatedAt,
                CreatedByLecturerName = attendanceSession.CreatedByLecturer.User.FullName,
                PracticeGroupId = attendanceSession.PracticeGroupId,
                PracticeGroupName = attendanceSession.PracticeGroup?.GroupName,
                TotalStudents = totalStudents,
                PresentCount = presentCount,
                AbsentCount = absentCount,
                LateCount = lateCount,
                ExcusedCount = excusedCount,
                AttendanceRate = attendanceRate,
                AttendanceRecords = attendances.Select(a => new AttendanceRecordResponse
                {
                    AttendanceId = a.AttendanceId,
                    StudentId = a.StudentId,
                    MSSV = a.Student.MSSV,
                    StudentName = a.Student.User.FullName,
                    ClassName = a.Student.Class.ClassName,
                    Status = a.Status,
                    StatusVietnamese = GetAttendanceStatusInVietnamese(a.Status),
                    RecordedAt = a.RecordedAt,
                    Note = a.Note,
                    RecordedByLecturerName = a.RecordedByLecturer?.User?.FullName ?? ""
                }).OrderBy(a => a.MSSV).ToList()
            };

            return response;
        }

        public async Task<PagedResult<AttendanceSessionResponse>> GetAttendanceSessionsByLecturerAsync(
    string lecturerCode,
    PaginationParams pagination,
    int? sectionId = null,
    int? scheduleTypeId = null,
    DateTime? fromDate = null,
    DateTime? toDate = null)
        {
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.User.Username == lecturerCode)
                ?? throw new Exception("Lecturer not found");

            var query = context.AttendanceSessions
                .Include(a => a.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(a => a.CreatedByLecturer)
                    .ThenInclude(l => l.User)
                .Include(a => a.PracticeGroup)
                .Where(a => a.CreatedByLecturerId == lecturer.Id ||
                           a.Section.Lecturer.Id == lecturer.Id ||
                           (a.PracticeGroupId.HasValue && a.PracticeGroup.LecturerId == lecturer.Id));

            // Apply filters
            if (sectionId.HasValue)
            {
                query = query.Where(a => a.SectionId == sectionId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(a => a.SessionDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(a => a.SessionDate <= toDate.Value);
            }

            // Add scheduleTypeId filter by joining with Schedules table
            if (scheduleTypeId.HasValue)
            {
                query = query.Where(a =>
                    // For theory sessions (no practice group), check section's main schedules
                    (!a.PracticeGroupId.HasValue &&
                     context.Schedules.Any(s => s.Section.SectionId == a.SectionId &&
                                               s.ScheduleType.ScheduleTypeId == scheduleTypeId.Value &&
                                               !s.PracticeGroupId.HasValue)) ||
                    // For practice sessions, check practice group's schedules
                    (a.PracticeGroupId.HasValue &&
                     context.Schedules.Any(s => s.PracticeGroupId == a.PracticeGroupId &&
                                               s.ScheduleType.ScheduleTypeId == scheduleTypeId.Value))
                );
            }

            var totalCount = await query.CountAsync();

            var sessions = await query
                .OrderByDescending(a => a.SessionDate)
                .ThenByDescending(a => a.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var responses = new List<AttendanceSessionResponse>();
            foreach (var session in sessions)
            {
                var response = await GetAttendanceSessionByIdAsync(session.AttendanceSessionId);
                responses.Add(response);
            }

            return new PagedResult<AttendanceSessionResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }
        private async Task CreateInitialAttendanceRecordsAsync(AttendanceSession attendanceSession, int? practiceGroupId)
        {
            List<int> studentIds;

            if (practiceGroupId.HasValue)
            {
                // Get students in the practice group
                studentIds = await context.PracticeGroupEnrollments
                    .Where(pge => pge.PracticeGroupId == practiceGroupId.Value && pge.IsActive)
                    .Select(pge => pge.StudentId)
                    .ToListAsync();
            }
            else
            {
                // Get all students enrolled in the section
                studentIds = await context.Enrollments
                    .Where(e => e.Section.SectionId == attendanceSession.SectionId && 
                               e.enrollmentStatus == EnrollmentStatus.Enrolled)
                    .Select(e => e.Student.Id)
                    .ToListAsync();
            }

            // Create attendance records with default status as Present
            foreach (var studentId in studentIds)
            {
                var attendance = new Attendance
                {
                    AttendanceSessionId = attendanceSession.AttendanceSessionId,
                    StudentId = studentId,
                    SectionId = attendanceSession.SectionId,
                    Status = AttendanceStatus.Unknown, // Default status
                    RecordedByLecturerId = attendanceSession.CreatedByLecturerId
                };

                context.Attendances.Add(attendance);
            }

            await context.SaveChangesAsync();
        }

        private string GetAttendanceStatusInVietnamese(AttendanceStatus status)
        {
            return status switch
            {
                AttendanceStatus.Present => "Có mặt",
                AttendanceStatus.Absent => "Vắng mặt",
                AttendanceStatus.Late => "Đi muộn",
                AttendanceStatus.Excused => "Vắng có phép",
                AttendanceStatus.Left => "Về sớm",
                _ => "Unknown"
            };
        }

        public async Task<bool> UpdateAttendanceAsync(int attendanceId, UpdateAttendanceRequest request, string lecturerCode)
        {
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.User.Username == lecturerCode)
                ?? throw new Exception("Không tìm thấy giảng viên");

            var attendance = await context.Attendances
                .Include(a => a.AttendanceSession)
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId)
                ?? throw new Exception("Không tìm thấy hồ sơ điểm danh");

            // Verify permission
            var hasPermission = attendance.AttendanceSession.CreatedByLecturerId == lecturer.Id ||
                               attendance.RecordedByLecturerId == lecturer.Id;

            if (!hasPermission)
            {
                throw new Exception("Bạn không có quyền cập nhật hồ sơ tham dự này");
            }

            attendance.Status = request.Status;
            attendance.Note = request.Note;
            attendance.RecordedAt = DateTime.Now;
            attendance.RecordedByLecturerId = lecturer.Id;

            context.Attendances.Update(attendance);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAttendanceSessionAsync(int attendanceSessionId, string lecturerCode)
        {
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.User.Username == lecturerCode)
                ?? throw new Exception("Không tìm thấy giảng viên");

            var attendanceSession = await context.AttendanceSessions
                .Include(a => a.Attendances)
                .FirstOrDefaultAsync(a => a.AttendanceSessionId == attendanceSessionId)
                ?? throw new Exception("Không tìm thấy phiên điểm danh");

            // Verify permission
            if (attendanceSession.CreatedByLecturerId != lecturer.Id)
            {
                throw new Exception("Bạn không có quyền xóa phiên tham dự này");
            }

            // Delete related attendance records first
            context.Attendances.RemoveRange(attendanceSession.Attendances);
            context.AttendanceSessions.Remove(attendanceSession);

            return await context.SaveChangesAsync() > 0;
        }

        public async Task<StudentAttendanceStatisticsResponse> GetStudentAttendanceStatisticsAsync(int studentId, int sectionId)
        {
            // Lấy thông tin sinh viên
            var student = await context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                .FirstOrDefaultAsync(s => s.Id == studentId)
                ?? throw new Exception($"Student with ID {studentId} not found");

            // Lấy thông tin section
            var section = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId)
                ?? throw new Exception($"Section with ID {sectionId} not found");

            // Kiểm tra xem sinh viên có đăng ký học phần này không
            var enrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.Student.Id == studentId &&
                                         e.Section.SectionId == sectionId &&
                                         e.enrollmentStatus == EnrollmentStatus.Enrolled);

            if (enrollment == null)
            {
                throw new Exception("Student is not enrolled in this section");
            }

            // Lấy tất cả attendance records của sinh viên trong section này
            var attendanceRecords = await context.Attendances
                .Include(a => a.AttendanceSession)
                .Where(a => a.StudentId == studentId && a.SectionId == sectionId)
                .OrderBy(a => a.AttendanceSession.SessionDate)
                .ToListAsync();

            // Lấy tất cả attendance sessions của section để biết tổng số buổi học
            var allSessions = await context.AttendanceSessions
                .Where(ats => ats.SectionId == sectionId && ats.IsActive)
                .CountAsync();

            // Tính toán thống kê
            var totalSessions = allSessions;
            var presentCount = attendanceRecords.Count(a => a.Status == AttendanceStatus.Present);
            var absentCount = attendanceRecords.Count(a => a.Status == AttendanceStatus.Absent);
            var lateCount = attendanceRecords.Count(a => a.Status == AttendanceStatus.Late);
            var excusedCount = attendanceRecords.Count(a => a.Status == AttendanceStatus.Excused);
            var leftEarlyCount = attendanceRecords.Count(a => a.Status == AttendanceStatus.Left);

            // Tính tỷ lệ điểm danh (Present + Late được coi là có mặt)
            var attendanceRate = totalSessions > 0 ?
                Math.Round((double)(presentCount + lateCount) / totalSessions * 100, 2) : 0.0;

            // Tạo danh sách chi tiết attendance records
            var attendanceDetailRecords = attendanceRecords.Select(a => new Models.Dto.Response.StudentAttendanceRecord
            {
                AttendanceSessionId = a.AttendanceSessionId,
                SessionDate = a.AttendanceSession.SessionDate,
                SessionName = a.AttendanceSession.SessionName,
                Status = a.Status,
                StatusVietnamese = GetAttendanceStatusInVietnamese(a.Status),
                Note = a.Note
            }).ToList();

            return new StudentAttendanceStatisticsResponse
            {
                StudentId = student.Id,
                MSSV = student.MSSV,
                StudentName = student.User.FullName,
                ClassName = student.Class.ClassName,
                SectionId = section.SectionId,
                SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                CourseName = section.CurriculumCourse.Course.CourseName,
                TotalSessions = totalSessions,
                PresentCount = presentCount,
                AbsentCount = absentCount,
                LateCount = lateCount,
                ExcusedCount = excusedCount,
                AttendanceRate = attendanceRate,
                AttendanceRecords = attendanceDetailRecords
            };
        }

        public async Task<SectionAllAttendanceStatisticsResponse> GetSectionAttendanceStatisticsAsync(int sectionId)
        {
            // Kiểm tra section tồn tại
            var section = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Semester)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId)
                ?? throw new Exception($"Section with ID {sectionId} not found");

            // Lấy tất cả sinh viên đăng ký section này
            var enrolledStudents = await context.Enrollments
                .Include(e => e.Student)
                    .ThenInclude(s => s.User)
                .Include(e => e.Student)
                    .ThenInclude(s => s.Class)
                .Where(e => e.Section.SectionId == sectionId &&
                           e.enrollmentStatus == EnrollmentStatus.Enrolled)
                .Select(e => e.Student)
                .OrderBy(s => s.MSSV)
                .ToListAsync();

            if (!enrolledStudents.Any())
            {
                throw new Exception("No students enrolled in this section");
            }

            // Lấy tất cả attendance sessions của section
            var attendanceSessions = await context.AttendanceSessions
                .Where(ats => ats.SectionId == sectionId && ats.IsActive)
                .OrderBy(ats => ats.SessionDate)
                .ToListAsync();

            // Lấy tất cả attendance records của section này
            var studentIds = enrolledStudents.Select(s => s.Id).ToList();
            var allAttendanceRecords = await context.Attendances
                .Include(a => a.AttendanceSession)
                .Include(a => a.Student)
                .Where(a => a.SectionId == sectionId && studentIds.Contains(a.StudentId))
                .ToListAsync();

            // Tính thống kê cho từng sinh viên
            var studentAttendanceDetails = new List<StudentAttendanceDetail>();

            foreach (var student in enrolledStudents)
            {
                var studentAttendances = allAttendanceRecords
                    .Where(a => a.StudentId == student.Id)
                    .ToList();

                var presentCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Present);
                var absentCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Absent);
                var lateCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Late);
                var excusedCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Excused);
                var leftEarlyCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Left);

                var totalSessions = attendanceSessions.Count;
                var attendanceRate = totalSessions > 0 ?
                    Math.Round((double)(presentCount + lateCount) / totalSessions * 100, 2) : 0;
                var presentRate = totalSessions > 0 ?
                    Math.Round((double)presentCount / totalSessions * 100, 2) : 0;

                // Chi tiết từng buổi học
                var sessionDetails = new List<StudentSessionDetail>();
                foreach (var session in attendanceSessions)
                {
                    var attendance = studentAttendances.FirstOrDefault(a => a.AttendanceSessionId == session.AttendanceSessionId);

                    sessionDetails.Add(new StudentSessionDetail
                    {
                        AttendanceSessionId = session.AttendanceSessionId,
                        SessionDate = session.SessionDate,
                        SessionName = session.SessionName,
                        Status = attendance?.Status.ToString() ?? "Unknown",
                        StatusVietnamese = attendance != null ? GetAttendanceStatusInVietnamese(attendance.Status) : "Chưa điểm danh",
                        Note = attendance?.Note
                    });
                }

                var studentDetail = new StudentAttendanceDetail
                {
                    StudentId = student.Id,
                    MSSV = student.MSSV,
                    StudentName = student.User.FullName,
                    ClassName = student.Class.ClassName,
                    TotalSessions = totalSessions,
                    PresentCount = presentCount,
                    AbsentCount = absentCount,
                    LateCount = lateCount,
                    ExcusedCount = excusedCount,
                    LeftEarlyCount = leftEarlyCount,
                    AttendanceRate = attendanceRate,
                    PresentRate = presentRate,
                    AttendanceLevel = GetAttendanceLevel(attendanceRate),
                    SessionDetails = sessionDetails
                };

                studentAttendanceDetails.Add(studentDetail);
            }

            // Tính thống kê theo buổi học
            var sessionAttendanceDetails = new List<SessionAttendanceDetail>();
            int sessionNumber = 1;

            foreach (var session in attendanceSessions)
            {
                var sessionAttendances = allAttendanceRecords
                    .Where(a => a.AttendanceSessionId == session.AttendanceSessionId)
                    .ToList();

                var presentCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Present);
                var absentCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Absent);
                var lateCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Late);
                var excusedCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Excused);
                var leftEarlyCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Left);

                var totalStudents = enrolledStudents.Count;
                var attendanceRate = totalStudents > 0 ?
                    Math.Round((double)(presentCount + lateCount) / totalStudents * 100, 2) : 0;

                var sessionDetail = new SessionAttendanceDetail
                {
                    AttendanceSessionId = session.AttendanceSessionId,
                    SessionDate = session.SessionDate,
                    SessionName = session.SessionName,
                    SessionNumber = sessionNumber++,
                    TotalStudents = totalStudents,
                    PresentCount = presentCount,
                    AbsentCount = absentCount,
                    LateCount = lateCount,
                    ExcusedCount = excusedCount,
                    LeftEarlyCount = leftEarlyCount,
                    AttendanceRate = attendanceRate
                };

                sessionAttendanceDetails.Add(sessionDetail);
            }

            // Tính tổng thống kê
            var totalAttendanceRecords = allAttendanceRecords.Count;
            var totalPresentRecords = allAttendanceRecords.Count(a => a.Status == AttendanceStatus.Present);
            var totalAbsentRecords = allAttendanceRecords.Count(a => a.Status == AttendanceStatus.Absent);
            var totalLateRecords = allAttendanceRecords.Count(a => a.Status == AttendanceStatus.Late);
            var totalExcusedRecords = allAttendanceRecords.Count(a => a.Status == AttendanceStatus.Excused);
            var totalLeftEarlyRecords = allAttendanceRecords.Count(a => a.Status == AttendanceStatus.Left);

            var overallAttendanceRate = totalAttendanceRecords > 0 ?
                Math.Round((double)(totalPresentRecords + totalLateRecords) / totalAttendanceRecords * 100, 2) : 0;

            var attendanceSummary = new AttendanceStatusSummary
            {
                TotalPresentRecords = totalPresentRecords,
                TotalAbsentRecords = totalAbsentRecords,
                TotalLateRecords = totalLateRecords,
                TotalExcusedRecords = totalExcusedRecords,
                TotalLeftEarlyRecords = totalLeftEarlyRecords,
                PresentPercentage = totalAttendanceRecords > 0 ?
                    Math.Round((double)totalPresentRecords / totalAttendanceRecords * 100, 2) : 0,
                AbsentPercentage = totalAttendanceRecords > 0 ?
                    Math.Round((double)totalAbsentRecords / totalAttendanceRecords * 100, 2) : 0,
                LatePercentage = totalAttendanceRecords > 0 ?
                    Math.Round((double)totalLateRecords / totalAttendanceRecords * 100, 2) : 0,
                ExcusedPercentage = totalAttendanceRecords > 0 ?
                    Math.Round((double)totalExcusedRecords / totalAttendanceRecords * 100, 2) : 0,
                LeftEarlyPercentage = totalAttendanceRecords > 0 ?
                    Math.Round((double)totalLeftEarlyRecords / totalAttendanceRecords * 100, 2) : 0
            };

            return new SectionAllAttendanceStatisticsResponse
            {
                SectionId = section.SectionId,
                SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                CourseCode = section.CurriculumCourse.Course.CourseCode,
                CourseName = section.CurriculumCourse.Course.CourseName,
                SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
                LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",
                TotalStudents = enrolledStudents.Count,
                TotalSessions = attendanceSessions.Count,
                OverallAttendanceRate = overallAttendanceRate,
                StudentAttendanceDetails = studentAttendanceDetails,
                SessionAttendanceDetails = sessionAttendanceDetails,
                AttendanceSummary = attendanceSummary
            };
        }

        public async Task<SectionAttendanceExportResponse> GetSectionAttendanceExportAsync(int sectionId)
        {
            // Kiểm tra section tồn tại
            var section = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Semester)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId)
                ?? throw new Exception($"Section with ID {sectionId} not found");

            // Lấy tất cả sinh viên đăng ký section này
            var enrolledStudents = await context.Enrollments
                .Include(e => e.Student)
                    .ThenInclude(s => s.User)
                .Include(e => e.Student)
                    .ThenInclude(s => s.Class)
                .Where(e => e.Section.SectionId == sectionId &&
                           e.enrollmentStatus == EnrollmentStatus.Enrolled)
                .OrderBy(e => e.Student.MSSV)
                .ToListAsync();

            if (!enrolledStudents.Any())
            {
                throw new Exception("No students enrolled in this section");
            }

            // Lấy tất cả attendance sessions của section (đã có điểm danh)
            var attendanceSessions = await context.AttendanceSessions
                .Where(ats => ats.SectionId == sectionId && ats.IsActive)
                .OrderBy(ats => ats.SessionDate)
                .ToListAsync();

            // Lấy tất cả attendance records
            var studentIds = enrolledStudents.Select(e => e.Student.Id).ToList();
            var sessionIds = attendanceSessions.Select(s => s.AttendanceSessionId).ToList();

            var allAttendanceRecords = await context.Attendances
                .Include(a => a.AttendanceSession)
                .Where(a => studentIds.Contains(a.StudentId) && sessionIds.Contains(a.AttendanceSessionId))
                .ToListAsync();

            // Tạo session headers
            var sessionHeaders = attendanceSessions.Select((session, index) => new AttendanceSessionHeader
            {
                AttendanceSessionId = session.AttendanceSessionId,
                SessionName = session.SessionName,
                SessionDate = session.SessionDate,
                SessionNumber = index + 1
            }).ToList();

            // Tạo ma trận điểm danh cho từng sinh viên
            var studentRows = new List<StudentAttendanceRow>();

            foreach (var enrollment in enrolledStudents)
            {
                var student = enrollment.Student;
                var studentAttendances = allAttendanceRecords
                    .Where(a => a.StudentId == student.Id)
                    .ToList();

                // Tạo attendance matrix
                var attendanceMatrix = new Dictionary<int, AttendanceCell>();

                foreach (var session in attendanceSessions)
                {
                    var attendance = studentAttendances.FirstOrDefault(a => a.AttendanceSessionId == session.AttendanceSessionId);

                    var cell = new AttendanceCell();

                    if (attendance != null)
                    {
                        cell.Status = attendance.Status.ToString();
                        cell.StatusSymbol = GetStatusSymbol(attendance.Status);
                        cell.StatusVietnamese = GetAttendanceStatusInVietnamese(attendance.Status);
                        cell.Note = attendance.Note;
                        cell.CellColor = GetStatusColor(attendance.Status);
                    }
                    else
                    {
                        // Chưa điểm danh hoặc không có dữ liệu
                        cell.Status = "Unknown";
                        cell.StatusSymbol = "?";
                        cell.StatusVietnamese = "Chưa điểm danh";
                        cell.Note = null;
                        cell.CellColor = "#f0f0f0"; // Gray
                    }

                    attendanceMatrix[session.AttendanceSessionId] = cell;
                }

                // Tính thống kê cho sinh viên
                var presentCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Present);
                var absentCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Absent);
                var lateCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Late);
                var excusedCount = studentAttendances.Count(a => a.Status == AttendanceStatus.Excused);

                var totalSessions = attendanceSessions.Count;
                var attendanceRate = totalSessions > 0 ?
                    Math.Round((double)(presentCount + lateCount) / totalSessions * 100, 2) : 0;

                var studentRow = new StudentAttendanceRow
                {
                    StudentId = student.Id,
                    MSSV = student.MSSV,
                    StudentName = student.User.FullName,
                    ClassName = student.Class.ClassName,
                    AttendanceMatrix = attendanceMatrix,
                    TotalPresent = presentCount,
                    TotalAbsent = absentCount,
                    TotalLate = lateCount,
                    TotalExcused = excusedCount,
                    AttendanceRate = attendanceRate,
                    AttendanceLevel = GetAttendanceLevel(attendanceRate)
                };

                studentRows.Add(studentRow);
            }

            // Tạo thống kê cho từng buổi học
            var sessionSummaries = new List<SessionStatisticsSummary>();

            foreach (var (session, index) in attendanceSessions.Select((s, i) => (s, i)))
            {
                var sessionAttendances = allAttendanceRecords
                    .Where(a => a.AttendanceSessionId == session.AttendanceSessionId)
                    .ToList();

                var presentCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Present);
                var absentCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Absent);
                var lateCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Late);
                var excusedCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Excused);
                var leftEarlyCount = sessionAttendances.Count(a => a.Status == AttendanceStatus.Left);

                var totalStudents = enrolledStudents.Count;
                var recordedCount = sessionAttendances.Count;
                var unknownCount = totalStudents - recordedCount;

                var attendanceRate = totalStudents > 0 ?
                    Math.Round((double)(presentCount + lateCount) / totalStudents * 100, 2) : 0;

                var summary = new SessionStatisticsSummary
                {
                    AttendanceSessionId = session.AttendanceSessionId,
                    SessionName = session.SessionName,
                    SessionDate = session.SessionDate,
                    SessionNumber = index + 1,
                    PresentCount = presentCount,
                    AbsentCount = absentCount,
                    LateCount = lateCount,
                    ExcusedCount = excusedCount,
                    LeftEarlyCount = leftEarlyCount,
                    UnknownCount = unknownCount,
                    AttendanceRate = attendanceRate,
                    PresentPercentage = totalStudents > 0 ? Math.Round((double)presentCount / totalStudents * 100, 2) : 0,
                    AbsentPercentage = totalStudents > 0 ? Math.Round((double)absentCount / totalStudents * 100, 2) : 0
                };

                sessionSummaries.Add(summary);
            }

            // Tính thống kê tổng
            var totalAttendanceRecords = allAttendanceRecords.Count;
            var totalPossibleRecords = enrolledStudents.Count * attendanceSessions.Count;
            var overallAttendanceRate = totalPossibleRecords > 0 ?
                Math.Round((double)allAttendanceRecords.Count(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late) / totalPossibleRecords * 100, 2) : 0;

            return new SectionAttendanceExportResponse
            {
                SectionId = section.SectionId,
                SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                CourseCode = section.CurriculumCourse.Course.CourseCode,
                CourseName = section.CurriculumCourse.Course.CourseName,
                SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
                LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",
                ExportedAt = DateTime.Now,
                TotalStudents = enrolledStudents.Count,
                TotalSessions = attendanceSessions.Count,
                OverallAttendanceRate = overallAttendanceRate,
                SessionHeaders = sessionHeaders,
                StudentRows = studentRows,
                SessionSummaries = sessionSummaries
            };
        }

        private static string GetStatusSymbol(AttendanceStatus status)
        {
            return status switch
            {
                AttendanceStatus.Present => "P",
                AttendanceStatus.Absent => "A",
                AttendanceStatus.Late => "L",
                AttendanceStatus.Excused => "E",
                AttendanceStatus.Left => "X",
                _ => "?"
            };
        }

        private static string GetStatusColor(AttendanceStatus status)
        {
            return status switch
            {
                AttendanceStatus.Present => "#4CAF50",     // Green
                AttendanceStatus.Absent => "#F44336",      // Red  
                AttendanceStatus.Late => "#FF9800",        // Orange
                AttendanceStatus.Excused => "#2196F3",     // Blue
                AttendanceStatus.Left => "#9C27B0",        // Purple
                _ => "#f0f0f0"                             // Gray
            };
        }

        private static string GetAttendanceLevel(double attendanceRate)
        {
            return attendanceRate switch
            {
                >= 90 => "Excellent", // Xuất sắc
                >= 80 => "Good",      // Tốt
                >= 70 => "Average",   // Trung bình
                >= 60 => "Warning",   // Cảnh báo
                _ => "Poor"           // Kém
            };
        }

        // **NEW: Student self check-in methods**

        public async Task<List<AvailableCheckInSessionResponse>> GetAvailableCheckInSessionsForStudentAsync(string mssv)
        {
            var student = await context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception("Student not found");

            var now = DateTime.Now;
            
            // Get attendance sessions where:
            // 1. Student is enrolled in the section
            // 2. Self check-in is enabled
            // 3. Check-in window is active or upcoming (within 30 minutes)
            var availableSessions = await context.AttendanceSessions
                .Include(ats => ats.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(ats => ats.Section)
                    .ThenInclude(s => s.Lecturer)
                        .ThenInclude(l => l.User)
                .Where(ats => 
                    ats.AllowSelfCheckIn &&
                    ats.IsActive &&
                    ats.SelfCheckInStartTime.HasValue &&
                    ats.SelfCheckInEndTime.HasValue &&
                    ats.SelfCheckInEndTime.Value > now &&
                    // Check if student is enrolled in this section
                    context.Enrollments.Any(e => 
                        e.Student.Id == student.Id && 
                        e.Section.SectionId == ats.SectionId &&
                        e.enrollmentStatus == EnrollmentStatus.Enrolled))
                .OrderBy(ats => ats.SessionDate)
                .ThenBy(ats => ats.StartTime)
                .ToListAsync();

            var responses = new List<AvailableCheckInSessionResponse>();

            foreach (var session in availableSessions)
            {
                // Check if student has already checked in
                var existingAttendance = await context.Attendances
                    .FirstOrDefaultAsync(a => 
                        a.AttendanceSessionId == session.AttendanceSessionId &&
                        a.StudentId == student.Id);

                var hasCheckedIn = existingAttendance != null && 
                                  existingAttendance.Status != AttendanceStatus.Unknown;

                var isCheckInActive = now >= session.SelfCheckInStartTime && 
                                     now <= session.SelfCheckInEndTime;

                var minutesUntilStart = session.SelfCheckInStartTime.HasValue 
                    ? Math.Max(0, (int)(session.SelfCheckInStartTime.Value - now).TotalMinutes)
                    : 0;

                var minutesUntilEnd = session.SelfCheckInEndTime.HasValue
                    ? Math.Max(0, (int)(session.SelfCheckInEndTime.Value - now).TotalMinutes)
                    : 0;

                var response = new AvailableCheckInSessionResponse
                {
                    AttendanceSessionId = session.AttendanceSessionId,
                    SessionName = session.SessionName,
                    CourseName = session.Section.CurriculumCourse.Course.CourseName,
                    CourseCode = session.Section.CurriculumCourse.Course.CourseCode,
                    SectionCode = session.Section.SectionCode ?? $"LHP{session.SectionId}",
                    SessionDate = session.SessionDate,
                    StartTime = session.StartTime,
                    EndTime = session.EndTime,
                    Room = session.Room,
                    
                    SelfCheckInStartTime = session.SelfCheckInStartTime.Value,
                    SelfCheckInEndTime = session.SelfCheckInEndTime.Value,
                    
                    IsCheckInActive = isCheckInActive,
                    HasCheckedIn = hasCheckedIn,
                    CurrentStatus = existingAttendance?.Status.ToString(),
                    CheckedInAt = existingAttendance?.RecordedAt,
                    MinutesUntilStart = minutesUntilStart,
                    MinutesUntilEnd = minutesUntilEnd,
                    
                    LecturerName = session.Section.Lecturer?.User?.FullName ?? "Not Assigned"
                };

                responses.Add(response);
            }

            return responses;
        }

        public async Task<StudentSelfCheckInResponse> StudentSelfCheckInAsync(
            string mssv, 
            StudentSelfCheckInRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                var student = await context.Students
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.MSSV == mssv);

                if (student == null)
                {
                    return new StudentSelfCheckInResponse
                    {
                        IsSuccess = false,
                        Message = "Student not found",
                        Errors = { "Không tìm thấy thông tin sinh viên" }
                    };
                }

                // Get attendance session
                var attendanceSession = await context.AttendanceSessions
                    .Include(ats => ats.Section)
                        .ThenInclude(s => s.CurriculumCourse)
                            .ThenInclude(cc => cc.Course)
                    .FirstOrDefaultAsync(ats => ats.AttendanceSessionId == request.AttendanceSessionId);

                if (attendanceSession == null)
                {
                    return new StudentSelfCheckInResponse
                    {
                        IsSuccess = false,
                        Message = "Session not found",
                        Errors = { "Không tìm thấy phiên điểm danh" }
                    };
                }

                // Validate check-in eligibility
                var validationResult = await ValidateStudentCheckInAsync(student, attendanceSession, request);
                if (!validationResult.IsValid)
                {
                    return new StudentSelfCheckInResponse
                    {
                        IsSuccess = false,
                        Message = "Check-in validation failed",
                        Errors = validationResult.Errors
                    };
                }

                // Determine attendance status based on check-in time
                var now = DateTime.Now;

                var sessionStartTime = attendanceSession.SelfCheckInStartTime.HasValue
                    ? attendanceSession.SelfCheckInStartTime.Value.AddMinutes(5)
                    : now.AddMinutes(5); // fallback if null
                var lateThreshold = attendanceSession.SelfCheckInStartTime.HasValue
                    ? attendanceSession.SelfCheckInStartTime.Value.AddMinutes(15)
                    : now.AddMinutes(15); // fallback if null

                var attendanceStatus = now <= sessionStartTime 
                    ? AttendanceStatus.Present 
                    : now <= lateThreshold 
                        ? AttendanceStatus.Late 
                        : AttendanceStatus.Absent; // Still allow check-in but mark as present

                // Find or create attendance record
                var attendance = await context.Attendances
                    .FirstOrDefaultAsync(a => 
                        a.AttendanceSessionId == request.AttendanceSessionId &&
                        a.StudentId == student.Id);

                if (attendance == null)
                {
                    // Create new attendance record
                    attendance = new Attendance
                    {
                        AttendanceSessionId = request.AttendanceSessionId,
                        StudentId = student.Id,
                        SectionId = attendanceSession.SectionId,
                        Status = attendanceStatus,
                        Note = $"Self check-in{(string.IsNullOrEmpty(request.Note) ? "" : $": {request.Note}")}",
                        RecordedAt = now,
                        RecordedByLecturerId = null // Self check-in
                    };

                    context.Attendances.Add(attendance);
                }
                else if (attendance.Status == AttendanceStatus.Unknown)
                {
                    // Update existing unknown status
                    attendance.Status = attendanceStatus;
                    attendance.Note = $"Self check-in{(string.IsNullOrEmpty(request.Note) ? "" : $": {request.Note}")}";
                    attendance.RecordedAt = now;
                    
                    context.Attendances.Update(attendance);
                }
                else
                {
                    // Already checked in
                    return new StudentSelfCheckInResponse
                    {
                        IsSuccess = false,
                        Message = "Already checked in",
                        Errors = { "Bạn đã điểm danh cho buổi học này rồi" }
                    };
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new StudentSelfCheckInResponse
                {
                    IsSuccess = true,
                    Message = "Điểm danh thành công",
                    AttendanceId = attendance.AttendanceId,
                    AttendanceStatus = GetAttendanceStatusInVietnamese(attendance.Status),
                    CheckInTime = attendance.RecordedAt,
                    SessionName = attendanceSession.SessionName,
                    CourseName = attendanceSession.Section.CurriculumCourse.Course.CourseName
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new StudentSelfCheckInResponse
                {
                    IsSuccess = false,
                    Message = "System error",
                    Errors = { ex.Message }
                };
            }
        }

        private async Task<(bool IsValid, List<string> Errors)> ValidateStudentCheckInAsync(
            Student student,
            AttendanceSession attendanceSession, 
            StudentSelfCheckInRequest request)
        {
            var errors = new List<string>();
            var now = DateTime.Now;

            // Check if self check-in is enabled
            if (!attendanceSession.AllowSelfCheckIn)
            {
                errors.Add("Tự điểm danh không được bật cho buổi học này");
                return (false, errors);
            }

            // Check if within check-in window
            if (!attendanceSession.SelfCheckInStartTime.HasValue || 
                !attendanceSession.SelfCheckInEndTime.HasValue)
            {
                errors.Add("Thời gian điểm danh không được thiết lập");
                return (false, errors);
            }

            if (now < attendanceSession.SelfCheckInStartTime.Value)
            {
                var minutesUntilStart = (int)(attendanceSession.SelfCheckInStartTime.Value - now).TotalMinutes;
                errors.Add($"Chưa đến thời gian điểm danh (còn {minutesUntilStart} phút)");
                return (false, errors);
            }

            if (now > attendanceSession.SelfCheckInEndTime.Value)
            {
                errors.Add("Đã hết thời gian điểm danh");
                return (false, errors);
            }

            // Verify check-in code
            if (attendanceSession.CheckInCode != request.CheckInCode)
            {
                errors.Add("Mã điểm danh không chính xác");
                return (false, errors);
            }

            // Check if student is enrolled in the section
            var isEnrolled = await context.Enrollments
                .AnyAsync(e => 
                    e.Student.Id == student.Id && 
                    e.Section.SectionId == attendanceSession.SectionId &&
                    e.enrollmentStatus == EnrollmentStatus.Enrolled);

            if (!isEnrolled)
            {
                errors.Add("Bạn không được đăng ký trong lớp học phần này");
                return (false, errors);
            }
            return (errors.Count == 0, errors);
        }

        // Helper method to calculate distance between two coordinates
        private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000; // Earth's radius in meters
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        // Helper method to generate random 6-digit code
        private static string GenerateCheckInCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}