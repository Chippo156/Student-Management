using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class EnrollmentService(AppDbContext context) : IEnrollmentService
    {
        public Task<Enrollment> CreateEnrollmentAsync(EnrollmentRequest enrollmentRequest)
        {
            var student = context.Students.Find(enrollmentRequest.StudentId);
            if (student is null)
            {
                throw new Exception("Student not found");
            }
            
            var section = context.Sections.Find(enrollmentRequest.SectionId);
            if (section is null)
            {
                throw new Exception("Course not found");
            }

            Enrollment newEnrollment = new Enrollment
            {
                Student = student,
                Section = section,
                RegisteredAt = DateTime.Now,
                enrollmentStatus = EnrollmentStatus.Enrolled,
            };

            context.Enrollments.Add(newEnrollment);
            context.SaveChanges();
            return Task.FromResult(newEnrollment);
        }

        public Task<bool> DeleteEnrollmentAsync(int enrollmentId)
        {
            Enrollment enrollment = context.Enrollments.Find(enrollmentId) ?? throw new Exception("Enrollment not found");
            context.Enrollments.Remove(enrollment);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public Task<IEnumerable<Enrollment>> GetAllEnrollmentsAsync()
        {
            return Task.FromResult(context.Enrollments.AsEnumerable());
        }

        public Task<Enrollment?> GetEnrollmentByIdAsync(int enrollmentId)
        {
            Enrollment? enrollment = context.Enrollments.Find(enrollmentId);
            return Task.FromResult(enrollment);
        }

        public async Task<IEnumerable<Enrollment>> GetEnrollmentsByStudentIdAsync(int studentId)
        {
            var enrollments = context.Enrollments.Where(e => e.Student.Id == studentId)
                .Include(e => e.Section.CurriculumCourse)
                .Include(e => e.Section.Lecturer.User);
            return await enrollments.ToListAsync();
        }

        public Task<IEnumerable<Enrollment>> GetEnrollmentsByCourseIdAsync(int courseId)
        {
            var enrollments = context.Enrollments.Where(e => e.Student.Id == courseId);
            return Task.FromResult(enrollments.AsEnumerable());
        }
        public Task<IEnumerable<EnrollmentSemester>> GetEnrollmentBySemesterAsync(int semesterId, string mssv)
        {
           var enrollments = context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse.Course)
                .Where(e => e.Section.Semester.SemesterId == semesterId && e.Student.MSSV == mssv)
                .Select(e => new EnrollmentSemester
                {
                    courseCode = e.Section.CurriculumCourse.Course.CourseCode,
                    courseName = e.Section.CurriculumCourse.Course.CourseName,
                    creditsTheory = e.Section.CurriculumCourse.Course.CreditsTheory,
                    creditsLab = e.Section.CurriculumCourse.Course.CreditsLab,   
                });
            return Task.FromResult(enrollments.AsEnumerable());

        }

        public async Task<EnrollmentResultResponse> EnrollInCourseAsync(string mssv, CourseEnrollmentRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Get student information
                var student = await context.Students
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                            .ThenInclude(p => p.Department)
                    .FirstOrDefaultAsync(s => s.MSSV == mssv);

                if (student == null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Student not found",
                        Errors = { "Student with provided MSSV does not exist" }
                    };
                }

                // Get section information with all related data
                var section = await context.Sections
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                    .Include(s => s.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Semester)
                    .Include(s => s.Enrollments)
                    .FirstOrDefaultAsync(s => s.SectionId == request.SectionId);


                if (section == null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Section not found",
                        Errors = { "The requested section does not exist" }
                    };
                }

                if (section.Capacity <= section.EnrolledCount)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Section is full",
                        Errors = { "Lớp học phần đã đầy!" }
                    };
                }

                // Validation checks
                var validationResult = await ValidateEnrollmentAsync(student, section);
                if (!validationResult.IsValid)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Enrollment validation failed",
                        Errors = validationResult.Errors
                    };
                }

                // Check if student is already enrolled in this section
                var existingEnrollment = await context.Enrollments
                    .FirstOrDefaultAsync(e => e.Student.Id == student.Id && 
                                            e.Section.SectionId == section.SectionId);

                if (existingEnrollment != null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Already enrolled",
                        Errors = { "Sinh viên đã đăng ký học phần này!" }
                    };
                }

                // Check if student is already enrolled in another section of the same course in the same semester
                var duplicateEnrollment = await context.Enrollments
                    .Include(e => e.Section)
                        .ThenInclude(s => s.CurriculumCourse)
                    .FirstOrDefaultAsync(e => e.Student.Id == student.Id &&
                                            e.Section.CurriculumCourse.Course.CourseId == section.CurriculumCourse.Course.CourseId &&
                                            e.Section.Semester.SemesterId == section.Semester.SemesterId);

                if (duplicateEnrollment != null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Duplicate course enrollment",
                        Errors = { "Sinh viên đã đăng ký một lớp khác của môn học này trong cùng học kỳ." }
                    };
                }

                // Create enrollment
                var enrollment = new Enrollment
                {
                    Student = student,
                    Section = section,
                    enrollmentStatus = EnrollmentStatus.Enrolled,
                    RegisteredAt = DateTime.UtcNow
                };

                context.Enrollments.Add(enrollment);
                await context.SaveChangesAsync();

                // Update section enrollment count
                section.EnrolledCount = section.Enrollments.Count + 1;
                context.Sections.Update(section);

                // Handle practice group enrollment
                string practiceGroupInfo = "";
                if (section.CurriculumCourse.Course.CreditsLab > 0)
                {
                    if (request.PracticeGroupId.HasValue)
                    {
                        // Sinh viên đã chọn nhóm thực hành cụ thể
                        var practiceGroupResult = await EnrollInSpecificPracticeGroupAsync(student.Id, request.PracticeGroupId.Value);
                        practiceGroupInfo = practiceGroupResult.IsSuccess ? 
                            $". Đã đăng ký nhóm thực hành {practiceGroupResult.GroupName}" : 
                            $". Lỗi đăng ký nhóm thực hành: {practiceGroupResult.ErrorMessage}";
                    }
                    else
                    {
                        // Không chọn nhóm - có thể tự động phân hoặc để trống
                        practiceGroupInfo = ". Chưa chọn nhóm thực hành - vui lòng chọn nhóm sau";
                    }
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Create successful response
                return new EnrollmentResultResponse
                {
                    IsSuccess = true,
                    Message = "Successfully enrolled in course" + practiceGroupInfo,
                    EnrollmentId = enrollment.EnrollmentId,
                    EnrollmentDetails = new EnrollmentDetailInfo
                    {
                        EnrollmentId = enrollment.EnrollmentId,
                        SectionId = section.SectionId,
                        CourseCode = section.CurriculumCourse.Course.CourseCode,
                        CourseName = section.CurriculumCourse.Course.CourseName,
                        Credits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,
                        LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",
                        SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
                        RegisteredAt = enrollment.RegisteredAt,
                        EnrollmentStatus = enrollment.enrollmentStatus.ToString()
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new EnrollmentResultResponse
                {
                    IsSuccess = false,
                    Message = "Enrollment failed due to system error",
                    Errors = { ex.Message }
                };
            }
        }

        private async Task<(bool IsValid, List<string> Errors)> ValidateEnrollmentAsync(Student student, Section section)
        {
            var errors = new List<string>();
            var enrollments = context.Enrollments
                    .Where(e => e.Section.SectionId == section.SectionId)
                    .ToList();


            // Check registration period
            var registrationPeriod = await context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                .FirstOrDefaultAsync(rp => 
                    rp.Semester.SemesterId == section.Semester.SemesterId && 
                    rp.Department.DepartmentId == student.Class.Program.Department.DepartmentId);

            if (registrationPeriod == null || !registrationPeriod.IsActive)
            {
                errors.Add("Registration period is not active for your department");
            }

            // Check prerequisites
            var prerequisites = await context.Prerequisites
                .Include(p => p.PrerequisiteCourse)
                .Where(p => p.CourseId == section.CurriculumCourse.Course.CourseId)
                .ToListAsync();

            if (prerequisites.Any())
            {
                foreach (var prerequisite in prerequisites)
                {
                    var hasCompletedPrerequisite = await context.FinalResults
                        .Include(fr => fr.Section)
                            .ThenInclude(s => s.CurriculumCourse)
                        .AnyAsync(fr => fr.Student.Id == student.Id &&
                                      fr.Section.CurriculumCourse.Course.CourseId == prerequisite.PrerequisiteCourseId &&
                                      fr.GradePoint >= 1.0); // Passing grade

                    if (!hasCompletedPrerequisite)
                    {
                        errors.Add($"Chưa đạt học phần tiên quyết: {prerequisite.PrerequisiteCourse.CourseCode} - {prerequisite.PrerequisiteCourse.CourseName}.");
                    }
                }
            }


            // Check schedule conflicts
            var studentSchedules = await context.Enrollments
                .Include(e => e.Section)
                .Where(e => e.Student.Id == student.Id && 
                           e.Section.Semester.SemesterId == section.Semester.SemesterId)
                .SelectMany(e => e.Section.Schedules)
                .ToListAsync();

            var sectionSchedules = await context.Schedules
                .Where(s => s.Section.SectionId == section.SectionId)
                .ToListAsync();

            foreach (var newSchedule in sectionSchedules)
            {
                foreach (var existingSchedule in studentSchedules)
                {
                    // Check for time conflicts on the same day
                    if (newSchedule.DayOfWeek == existingSchedule.DayOfWeek &&
                        newSchedule.DayOfWeek.HasValue &&
                        DoTimesOverlap(newSchedule.StartTime, newSchedule.EndTime, 
                                     existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        errors.Add($"Lịch học bị trùng: {newSchedule.DayOfWeek} từ {newSchedule.StartTime} đến {newSchedule.EndTime}.");
                    }

                    // Check for conflicts on specific dates
                    if (newSchedule.Date.HasValue && existingSchedule.Date.HasValue &&
                        newSchedule.Date == existingSchedule.Date &&
                        DoTimesOverlap(newSchedule.StartTime, newSchedule.EndTime,
                                     existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        errors.Add($"Lịch học bị trùng: {newSchedule.DayOfWeek} từ {newSchedule.StartTime} đến {newSchedule.EndTime}.");
                    }
                }
            }

            return (errors.Count == 0, errors);
        }

        private static bool DoTimesOverlap(TimeOnly start1, TimeOnly end1, TimeOnly start2, TimeOnly end2)
        {
            return start1 < end2 && start2 < end1;
        }

        public async Task<IEnumerable<EnrolledSectionResponse>> GetEnrolledSectionsBySemesterAsync(string mssv, int semesterId)
        {
            var enrollments = await context.Enrollments
                .Include(e => e.Student)
                    .ThenInclude(s => s.Class)
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                
                .Include(e => e.Section.Lecturer)
                    .ThenInclude(l => l.User)
                .Include(e => e.Section.Semester)
                .Include(e => e.Section.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .Where(e => e.Student.MSSV == mssv && e.Section.Semester.SemesterId == semesterId && e.enrollmentStatus != EnrollmentStatus.Dropped)
                .ToListAsync();

            var result = new List<EnrolledSectionResponse>();

            foreach (var enrollment in enrollments)
            {
                var section = enrollment.Section;
                var course = section.CurriculumCourse.Course;
                var semester = section.Semester;
                
                // Get main schedules (not exams)
                var mainSchedules = section.Schedules
                    .Where(sch => sch.ScheduleType.ScheduleTypeId != 3) // Not exam schedules
                    .OrderBy(sch => sch.DayOfWeek)
                    .ThenBy(sch => sch.StartTime)
                    .ToList();

                // Create day and time info strings
                var dayInfo = string.Join(", ", mainSchedules
                    .Where(sch => sch.DayOfWeek.HasValue)
                    .Select(sch => GetDayOfWeekInVietnamese(sch.DayOfWeek.Value)));
                
                var timeInfo = string.Join(", ", mainSchedules
                    .Select(sch => $"{sch.StartTime:HH:mm}-{sch.EndTime:HH:mm}"));

                var roomInfo = string.Join(", ", mainSchedules
                    .Where(sch => !string.IsNullOrEmpty(sch.Room))
                    .Select(sch => sch.Room)
                    .Distinct());

                // Calculate tuition fee
                var tuitionFee = CalculateTuitionFee(course.CreditsTheory + course.CreditsLab);

                // Get registration period for payment deadline
                var registrationPeriod = await context.RegistrationPeriods
                    .Include(rp => rp.Semester)
                    .FirstOrDefaultAsync(rp => rp.Semester.SemesterId == semesterId);

                var enrolledSection = new EnrolledSectionResponse
                {
                    SectionId = section.SectionId,
                    SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                    CourseName = course.CourseName,
                    ExpectedClass = GetExpectedClassInfo(section),
                    Credits = course.CreditsTheory + course.CreditsLab,
                    LabGroup = await GetLabGroupInfoAsync(section, enrollment.Student.Id),
                    TuitionFee = tuitionFee,
                    PaymentDeadline = registrationPeriod?.EndDate ?? DateTime.Now.AddDays(30),
                    DayOfWeek = dayInfo,
                    StartDate = section.StartDate,
                    EndDate = section.EndDate,
                    RegistrationStatus = GetEnrollmentStatusInVietnamese(enrollment.enrollmentStatus),
                    RegistrationDate = enrollment.RegisteredAt,
                    SectionStatus = GetSectionStatusInVietnamese(section),
                    
                    // Additional information
                    LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",
                    Room = roomInfo,
                    TimeSlot = timeInfo,
                    CurrentEnrollment = section.EnrolledCount,
                    MaxCapacity = section.Capacity,
                    SemesterName = $"{semester.Year} - {semester.Term}"
                };

                result.Add(enrolledSection);
            }

            return result.OrderBy(r => r.CourseName).ToList();
        }

        public async Task<EnrollmentResultResponse> DropEnrollmentAsync(string mssv, int sectionId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Tìm sinh viên
                var student = await context.Students
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                            .ThenInclude(p => p.Department)
                    .FirstOrDefaultAsync(s => s.MSSV == mssv);

                if (student == null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Student not found",
                        Errors = { "Student with provided MSSV does not exist" }
                    };
                }

                // Tìm section
                var section = await context.Sections
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                    .Include(s => s.Lecturer)
                        .ThenInclude(l => l.User)
                    .Include(s => s.Semester)
                    .Include(s => s.Enrollments)

                    .FirstOrDefaultAsync(s => s.SectionId == sectionId);

                if (section == null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Section not found",
                        Errors = { "The requested section does not exist" }
                    };
                }

                // Tìm enrollment hiện tại
                var existingEnrollment = await context.Enrollments
                    .FirstOrDefaultAsync(e => e.Student.Id == student.Id && 
                                            e.Section.SectionId == section.SectionId);

                if (existingEnrollment == null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Enrollment not found",
                        Errors = { "Student is not enrolled in this section" }
                    };
                }

                // Kiểm tra có thể hủy đăng ký hay không
                var validationResult = await ValidateDropEnrollmentAsync(student, section, existingEnrollment);
                if (!validationResult.IsValid)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Drop enrollment validation failed",
                        Errors = validationResult.Errors
                    };
                }

                // Kiểm tra xem đã có điểm chưa (nếu có điểm thì không thể hủy)
                var hasGrades = await context.Grades
                    .AnyAsync(g => g.Student.Id == student.Id && 
                                  g.Assessment.Section.SectionId == section.SectionId);

                if (hasGrades)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Cannot drop enrollment",
                        Errors = { "Không thể hủy đăng ký học phần vì điểm của môn học này đã được nhập" }
                    };
                }

                // Lưu thông tin enrollment trước khi xóa để trả về response
                var enrollmentDetails = new EnrollmentDetailInfo
                {
                    EnrollmentId = existingEnrollment.EnrollmentId,
                    SectionId = section.SectionId,
                    CourseCode = section.CurriculumCourse.Course.CourseCode,
                    CourseName = section.CurriculumCourse.Course.CourseName,
                    Credits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,
                    LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",
                    SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
                    RegisteredAt = existingEnrollment.RegisteredAt,
                    EnrollmentStatus = "Dropped"
                };

                section.EnrolledCount = Math.Max(0, section.EnrolledCount - 1);

                var practiceGroupEnrollments = await context.PracticeGroupEnrollments
                    .Where(pge => pge.StudentId == student.Id && 
                                  pge.PracticeGroup.SectionId == section.SectionId && 
                                  pge.IsActive)
                    .ToListAsync();

                // Khi drop thì giảm số lượng trong practicegroup tương ứng
                foreach (var pge in practiceGroupEnrollments)
                {
                    var practiceGroup = await context.PracticeGroups
                        .FirstOrDefaultAsync(pg => pg.PracticeGroupId == pge.PracticeGroupId);
                    if (practiceGroup != null)
                    {
                        practiceGroup.CurrentCount = Math.Max(0, practiceGroup.CurrentCount - 1);
                        context.PracticeGroups.Update(practiceGroup);
                    }
                }

                context.PracticeGroupEnrollments.RemoveRange(practiceGroupEnrollments);
                

                context.Enrollments.Remove(existingEnrollment); 
                await context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return new EnrollmentResultResponse
                {
                    IsSuccess = true,
                    Message = "Successfully dropped enrollment",

                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new EnrollmentResultResponse
                {
                    IsSuccess = false,
                    Message = "Drop enrollment failed due to system error",
                    Errors = { ex.Message }
                };
            }
        }

        private async Task<(bool IsValid, List<string> Errors)> ValidateDropEnrollmentAsync(Student student, Section section, Enrollment enrollment)
        {
            var errors = new List<string>();

            // Kiểm tra thời gian cho phép hủy đăng ký
            var registrationPeriod = await context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                .FirstOrDefaultAsync(rp => 
                    rp.Semester.SemesterId == section.Semester.SemesterId && 
                    rp.Department.DepartmentId == student.Class.Program.Department.DepartmentId);

            if (registrationPeriod == null || !registrationPeriod.IsActive)
            {
                errors.Add("Thời gian đăng ký hiện không còn hiệu lực đối với khoa của bạn.");
            }

            // Kiểm tra đã quá thời hạn hủy đăng ký chưa (thường là trong vòng 2 tuần đầu học kỳ)
            var dropDeadline = section.StartDate.AddDays(14); // 2 tuần sau khi bắt đầu học
            if (DateOnly.FromDateTime(DateTime.Now) > dropDeadline)
            {
                errors.Add($"Đã quá hạn hủy đăng ký. Bạn chỉ có thể hủy trước ngày {dropDeadline:dd/MM/yyyy}.");
            }

            // Kiểm tra xem enrollment có đang ở trạng thái có thể hủy không
            if (enrollment.enrollmentStatus != EnrollmentStatus.Enrolled)
            {
                errors.Add($"Không thể hủy đăng ký có trạng thái: {enrollment.enrollmentStatus}.");
            }

            return (errors.Count == 0, errors);
        }

        // Helper methods remain the same as previously provided
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

        private string GetEnrollmentStatusInVietnamese(EnrollmentStatus status)
        {
            return status switch
            {
                EnrollmentStatus.Enrolled => "Đã đăng ký",
                EnrollmentStatus.Dropped => "Đã hủy",
                EnrollmentStatus.Completed => "Đã hoàn thành",
                _ => "Unknown"
            };
        }

        private string GetSectionStatusInVietnamese(Section section)
        {
            if (section.EnrolledCount >= section.Capacity)
                return "Full";
            else if (section.EnrolledCount > 0)
                return "Available";
            else
                return "New";
        }

        private string GetExpectedClassInfo(Section section)
        {
            return section.Class.ClassName ?? $"Lớp {section.Class.ClassName}";
        }

        private async Task<string> GetLabGroupInfoAsync(Section section, int studentId)
        {
            // Kiểm tra xem sinh viên có nhóm thực hành cụ thể không
            var studentPracticeGroup = await context.PracticeGroupEnrollments
                .Include(pge => pge.PracticeGroup)
                .Where(pge => pge.StudentId == studentId && 
                             pge.PracticeGroup.SectionId == section.SectionId && 
                             pge.IsActive)
                .Select(pge => pge.PracticeGroup.GroupName)
                .FirstOrDefaultAsync();

            if (!string.IsNullOrEmpty(studentPracticeGroup))
            {
                return $"{studentPracticeGroup}";
            }

            // Kiểm tra xem có nhóm thực hành không (nhưng sinh viên chưa chọn)
            var hasPracticeGroups = await context.PracticeGroups
                .AnyAsync(pg => pg.SectionId == section.SectionId && pg.IsActive);
            
            if (hasPracticeGroups)
            {
                return "Chưa chọn nhóm TH";
            }
            
            return "-";
        }

        private decimal CalculateTuitionFee(int totalCredits)
        {
            const decimal feePerCredit = 500000; // 500k per credit
            return totalCredits * feePerCredit;
        }       

        // Helper method để đăng ký nhóm thực hành cụ thể
        private async Task<(bool IsSuccess, string GroupName, string ErrorMessage)> EnrollInSpecificPracticeGroupAsync(int studentId, int practiceGroupId)
        {
            try
            {
                // Kiểm tra nhóm thực hành có tồn tại và còn chỗ không
                var practiceGroup = await context.PracticeGroups
                    .FirstOrDefaultAsync(pg => pg.PracticeGroupId == practiceGroupId && pg.IsActive);

                if (practiceGroup == null)
                {
                    return (false, "", "Nhóm thực hành không tồn tại");
                }

                if (practiceGroup.CurrentCount >= practiceGroup.MaxCapacity)
                {
                    return (false, "", "Nhóm thực hành đã đầy");
                }

                // Kiểm tra sinh viên đã có nhóm thực hành cho section này chưa
                var existingPracticeEnrollment = await context.PracticeGroupEnrollments
                    .Include(pge => pge.PracticeGroup)
                    .FirstOrDefaultAsync(pge => pge.StudentId == studentId && 
                                              pge.PracticeGroup.SectionId == practiceGroup.SectionId && 
                                              pge.IsActive);

                if (existingPracticeEnrollment != null)
                {
                    return (false, "", "Sinh viên đã có nhóm thực hành cho học phần này");
                }

                // Tạo enrollment vào nhóm thực hành
                var practiceGroupEnrollment = new PracticeGroupEnrollment
                {
                    PracticeGroupId = practiceGroupId,
                    StudentId = studentId
                };

                context.PracticeGroupEnrollments.Add(practiceGroupEnrollment);
                practiceGroup.CurrentCount++;
                context.PracticeGroups.Update(practiceGroup);

                await context.SaveChangesAsync();

                return (true, practiceGroup.GroupName, "");
            }
            catch (Exception ex)
            {
                return (false, "", ex.Message);
            }
        }
    }
}