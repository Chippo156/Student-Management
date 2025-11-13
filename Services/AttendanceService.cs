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
                    ?? throw new Exception("Lecturer not found");

                // Get section information
                var section = await context.Sections
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                    .Include(s => s.Lecturer)
                    .FirstOrDefaultAsync(s => s.SectionId == request.SectionId)
                    ?? throw new Exception("Section not found");

                // Verify lecturer owns this section or practice group
                if (request.PracticeGroupId.HasValue)
                {
                    var practiceGroup = await context.PracticeGroups
                        .FirstOrDefaultAsync(pg => pg.PracticeGroupId == request.PracticeGroupId.Value && 
                                                  pg.LecturerId == lecturer.Id)
                        ?? throw new Exception("Practice group not found or you don't have permission");
                }
                else
                {
                    if (section.Lecturer.Id != lecturer.Id)
                    {
                        throw new Exception("You don't have permission to create attendance for this section");
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
                    PracticeGroupId = request.PracticeGroupId
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
                    ?? throw new Exception("Lecturer not found");

                // Get attendance session
                var attendanceSession = await context.AttendanceSessions
                    .Include(a => a.Section)
                    .Include(a => a.PracticeGroup)
                    .FirstOrDefaultAsync(a => a.AttendanceSessionId == request.AttendanceSessionId)
                    ?? throw new Exception("Attendance session not found");

                // Verify permission
                var hasPermission = attendanceSession.CreatedByLecturerId == lecturer.Id ||
                                   attendanceSession.Section.Lecturer.Id == lecturer.Id ||
                                   (attendanceSession.PracticeGroupId.HasValue && 
                                    attendanceSession.PracticeGroup?.LecturerId == lecturer.Id);

                if (!hasPermission)
                {
                    throw new Exception("You don't have permission to record attendance for this session");
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
                        attendance.RecordedAt = DateTime.UtcNow;
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

        //public async Task<StudentAttendanceStatisticsResponse> GetStudentAttendanceStatisticsAsync(int studentId, int sectionId)
        //{
        //    var student = await context.Students
        //        .Include(s => s.User)
        //        .Include(s => s.Class)
        //        .FirstOrDefaultAsync(s => s.Id == studentId)
        //        ?? throw new Exception("Student not found");

        //    var section = await context.Sections
        //        .Include(s => s.CurriculumCourse)
        //            .ThenInclude(cc => cc.Course)
        //        .FirstOrDefaultAsync(s => s.SectionId == sectionId)
        //        ?? throw new Exception("Section not found");

        //    // Check if student is enrolled in this section
        //    var enrollment = await context.Enrollments
        //        .FirstOrDefaultAsync(e => e.Student.Id == studentId && e.Section.SectionId == sectionId)
        //        ?? throw new Exception("Student is not enrolled in this section");

        //    // Get all attendance records
        //    var attendances = await context.Attendances
        //        .Include(a => a.AttendanceSession)
        //        .Where(a => a.StudentId == studentId && a.SectionId == sectionId)
        //        .OrderBy(a => a.AttendanceSession.SessionDate)
        //        .ToListAsync();

        //    // Calculate statistics
        //    var totalSessions = attendances.Count;
        //    var presentCount = attendances.Count(a => a.Status == AttendanceStatus.Present);
        //    var absentCount = attendances.Count(a => a.Status == AttendanceStatus.Absent);
        //    var lateCount = attendances.Count(a => a.Status == AttendanceStatus.Late);
        //    var excusedCount = attendances.Count(a => a.Status == AttendanceStatus.Excused);
        //    var attendanceRate = totalSessions > 0 ? Math.Round((double)presentCount / totalSessions * 100, 2) : 0;

        //    var response = new StudentAttendanceStatisticsResponse
        //    {
        //        StudentId = student.Id,
        //        MSSV = student.MSSV,
        //        StudentName = student.User.FullName,
        //        ClassName = student.Class.ClassName,
        //        SectionId = section.SectionId,
        //        SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
        //        CourseName = section.CurriculumCourse.Course.CourseName,
        //        TotalSessions = totalSessions,
        //        PresentCount = presentCount,
        //        AbsentCount = absentCount,
        //        LateCount = lateCount,
        //        ExcusedCount = excusedCount,
        //        AttendanceRate = attendanceRate,
        //        AttendanceRecords = attendances.Select(a => new StudentAttendanceRecord
        //        {
        //            AttendanceSessionId = a.AttendanceSessionId,
        //            SessionDate = a.AttendanceSession.SessionDate,
        //            SessionName = a.AttendanceSession.SessionName,
        //            Status = a.Status,
        //            StatusVietnamese = GetAttendanceStatusInVietnamese(a.Status),
        //            Note = a.Note
        //        }).ToList()
        //    };

        //    return response;
        //}

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
                    Status = AttendanceStatus.Present, // Default status
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
                ?? throw new Exception("Lecturer not found");

            var attendance = await context.Attendances
                .Include(a => a.AttendanceSession)
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId)
                ?? throw new Exception("Attendance record not found");

            // Verify permission
            var hasPermission = attendance.AttendanceSession.CreatedByLecturerId == lecturer.Id ||
                               attendance.RecordedByLecturerId == lecturer.Id;

            if (!hasPermission)
            {
                throw new Exception("You don't have permission to update this attendance record");
            }

            attendance.Status = request.Status;
            attendance.Note = request.Note;
            attendance.RecordedAt = DateTime.UtcNow;
            attendance.RecordedByLecturerId = lecturer.Id;

            context.Attendances.Update(attendance);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAttendanceSessionAsync(int attendanceSessionId, string lecturerCode)
        {
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.User.Username == lecturerCode)
                ?? throw new Exception("Lecturer not found");

            var attendanceSession = await context.AttendanceSessions
                .Include(a => a.Attendances)
                .FirstOrDefaultAsync(a => a.AttendanceSessionId == attendanceSessionId)
                ?? throw new Exception("Attendance session not found");

            // Verify permission
            if (attendanceSession.CreatedByLecturerId != lecturer.Id)
            {
                throw new Exception("You don't have permission to delete this attendance session");
            }

            // Delete related attendance records first
            context.Attendances.RemoveRange(attendanceSession.Attendances);
            context.AttendanceSessions.Remove(attendanceSession);

            return await context.SaveChangesAsync() > 0;
        }

        public Task<StudentAttendanceStatisticsResponse> GetStudentAttendanceStatisticsAsync(int studentId, int sectionId)
        {
            throw new NotImplementedException();
        }
    }
}