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
        private const decimal DEFAULT_TUITION_PER_CREDIT = 500000; // 500k per credit

        public Task<Enrollment> CreateEnrollmentAsync(EnrollmentRequest enrollmentRequest)
        {
            var student = context.Students.Find(enrollmentRequest.StudentId);
            if (student is null)
            {
                throw new Exception("Không tìm thấy sinh viên");
            }
            
            var section = context.Sections.Find(enrollmentRequest.SectionId);
            if (section is null)
            {
                throw new Exception("Không tìm thấy môn học");
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
            Enrollment enrollment = context.Enrollments.Find(enrollmentId) ?? throw new Exception("Không tìm thấy thông tin đăng ký");
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
                        Message = "Không tìm thấy sinh viên",
                        Errors = { "Sinh viên không được tìm thấy với mã số sinh viên" }
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
                    .Include(s => s.Schedules)
                      .ThenInclude(s => s.ScheduleType)
                    .FirstOrDefaultAsync(s => s.SectionId == request.SectionId);

                if (section == null)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Không tìm thấy học phần",
                        Errors = { "Học phần yêu cầu không tồn tại" }
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

                var sectionStudentEnrolled = await context.Enrollments
                    .Where(e => section.Semester.SemesterId == e.Section.Semester.SemesterId && e.Student.MSSV == mssv && e.enrollmentStatus == EnrollmentStatus.Enrolled)
                    .CountAsync();

                if (sectionStudentEnrolled > 30)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Exceeded maximum enrolled sections",
                        Errors = { "Sinh viên đã đăng ký vượt quá số lượng học phần tối đa trong học kỳ này!" }
                    };
                }

                // Validation checks
                var validationResult = await ValidateEnrollmentAsync(student, section);
                if (!validationResult.IsValid)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Xác thực đăng ký không thành công",
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

                // **NEW: Check schedule conflicts before enrollment**
                var scheduleConflictResult = await CheckScheduleConflictsForStudentAsync(student.Id, section);
                if (!scheduleConflictResult.IsValid)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Xung đột lịch học",
                        Errors = scheduleConflictResult.Errors
                    };
                }

                // Create enrollment
                var enrollment = new Enrollment
                {
                    Student = student,
                    Section = section,
                    enrollmentStatus = EnrollmentStatus.Enrolled,
                    RegisteredAt = DateTime.Now
                };

                context.Enrollments.Add(enrollment);
                await context.SaveChangesAsync();

                // Update section enrollment count
                section.EnrolledCount = section.EnrolledCount + 1;
                context.Sections.Update(section);

                // Handle practice group enrollment
                string practiceGroupInfo = "";
                if (section.CurriculumCourse.Course.CreditsLab > 0)
                {
                    if (request.PracticeGroupId.HasValue)
                    {
                        // Sinh viên đã chọn nhóm thực hành cụ thể
                        var practiceGroupResult = await EnrollInSpecificPracticeGroupAsync(student.Id, request.PracticeGroupId.Value);
                        if (practiceGroupResult.IsSuccess == false)
                        {
                            await transaction.RollbackAsync();
                            return new EnrollmentResultResponse
                            {
                                IsSuccess = false,
                                Message = "Đăng ký không thành công",
                                Errors = { practiceGroupResult.ErrorMessage }
                            };
                        }
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

                // After successful enrollment, automatically generate or update tuition fee
                await HandleTuitionFeeCreationAsync(student, section, enrollment);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Create successful response
                return new EnrollmentResultResponse
                {
                    IsSuccess = true,
                    Message = "Đã đăng ký khóa học thành công" + practiceGroupInfo + ". Học phí đã được cập nhật.",
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
                    Message = "Đăng ký không thành công do lỗi hệ thống",
                    Errors = { ex.Message }
                };
            }
        }

        // **NEW: Method to check schedule conflicts for student enrollment**
        private async Task<(bool IsValid, List<string> Errors)> CheckScheduleConflictsForStudentAsync(int studentId, Section newSection)
        {
            var errors = new List<string>();

            // Get all schedules of the new section (lịch lý thuyết của section mới)
            var newSectionSchedules = newSection.Schedules
                .Where(sch => !sch.PracticeGroupId.HasValue && // Lịch lý thuyết
                             sch.ScheduleType.ScheduleTypeId != 3) // Không phải lịch thi
                .ToList();

            if (!newSectionSchedules.Any())
            {
                // Nếu section mới chưa có lịch thì không có xung đột
                return (true, errors);
            }

            // Get all current enrolled sections of the student in the same semester
            var studentCurrentEnrollments = await context.Enrollments
                .Include(e => e.Section)
                    .ThenInclude(s => s.Schedules)
                        .ThenInclude(sch => sch.ScheduleType)
                .Include(e => e.Section)
                    .ThenInclude(s => s.Semester)
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Where(e => e.Student.Id == studentId &&
                       e.Section.Semester.SemesterId == newSection.Semester.SemesterId &&
                       e.enrollmentStatus == EnrollmentStatus.Enrolled)
                .ToListAsync();

            // Get all theory schedules from student's current enrollments
            var studentTheorySchedules = new List<Schedule>();
            foreach (var enrollment in studentCurrentEnrollments)
            {
                var theorySchedules = enrollment.Section.Schedules
                    .Where(sch => !sch.PracticeGroupId.HasValue && // Lịch lý thuyết
                                 sch.ScheduleType.ScheduleTypeId != 3) // Không phải lịch thi
                    .ToList();

                studentTheorySchedules.AddRange(theorySchedules);
            }

            // Get all practice group schedules that student is enrolled in the same semester
            var studentPracticeSchedules = await context.PracticeGroupEnrollments
                .Include(pge => pge.PracticeGroup)
                    .ThenInclude(pg => pg.Schedules)
                        .ThenInclude(sch => sch.ScheduleType)
                .Include(pge => pge.PracticeGroup)
                    .ThenInclude(pg => pg.Section)
                        .ThenInclude(s => s.Semester)
                .Include(pge => pge.PracticeGroup)
                    .ThenInclude(pg => pg.Section)
                        .ThenInclude(s => s.CurriculumCourse)
                            .ThenInclude(cc => cc.Course)
                .Where(pge => pge.StudentId == studentId &&
                             pge.IsActive &&
                             pge.PracticeGroup.Section.Semester.SemesterId == newSection.Semester.SemesterId)
                .SelectMany(pge => pge.PracticeGroup.Schedules)
                .Where(sch => sch.ScheduleType.ScheduleTypeId != 3) // Không phải lịch thi
                .ToListAsync();

            // Combine all student's current schedules (theory + practice)
            var allStudentCurrentSchedules = studentTheorySchedules.Concat(studentPracticeSchedules).ToList();

            // Check conflicts between new section schedules and student's current schedules
            foreach (var newSchedule in newSectionSchedules)
            {
                foreach (var existingSchedule in allStudentCurrentSchedules)
                {
                    // Check conflict on recurring schedule (same day of week)
                    if (newSchedule.DayOfWeek.HasValue && existingSchedule.DayOfWeek.HasValue &&
                        newSchedule.DayOfWeek == existingSchedule.DayOfWeek &&
                        DoTimesOverlap(newSchedule.StartTime, newSchedule.EndTime,
                                      existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        var existingCourse = GetCourseFromSchedule(existingSchedule, studentCurrentEnrollments);
                        var existingScheduleType = existingSchedule.PracticeGroupId.HasValue ? "lịch thực hành" : "lịch lý thuyết";

                        errors.Add($"Lịch học bị trùng với {existingScheduleType} của môn {existingCourse}: " +
                                  $"{GetDayOfWeekInVietnamese(newSchedule.DayOfWeek.Value)} " +
                                  $"từ {newSchedule.StartTime:HH:mm} đến {newSchedule.EndTime:HH:mm}");
                    }

                    // Check conflict on specific dates
                    if (newSchedule.Date.HasValue && existingSchedule.Date.HasValue &&
                        newSchedule.Date == existingSchedule.Date &&
                        DoTimesOverlap(newSchedule.StartTime, newSchedule.EndTime,
                                      existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        var existingCourse = GetCourseFromSchedule(existingSchedule, studentCurrentEnrollments);
                        var existingScheduleType = existingSchedule.PracticeGroupId.HasValue ? "lịch thực hành" : "lịch lý thuyết";

                        errors.Add($"Lịch học bị trùng với {existingScheduleType} của môn {existingCourse}: " +
                                  $"{newSchedule.Date:dd/MM/yyyy} " +
                                  $"từ {newSchedule.StartTime:HH:mm} đến {newSchedule.EndTime:HH:mm}");
                    }
                }
            }

            return (errors.Count == 0, errors);
        }

        // **NEW: Helper method to get course info from schedule**
        private string GetCourseFromSchedule(Schedule schedule, List<Enrollment> enrollments)
        {
            if (schedule.PracticeGroupId.HasValue)
            {
                // This is a practice schedule, find from practice group enrollments
                var practiceGroup = context.PracticeGroups
                    .Include(pg => pg.Section)
                        .ThenInclude(s => s.CurriculumCourse)
                            .ThenInclude(cc => cc.Course)
                    .FirstOrDefault(pg => pg.PracticeGroupId == schedule.PracticeGroupId);

                return practiceGroup != null ?
                    $"{practiceGroup.Section.CurriculumCourse.Course.CourseCode} - {practiceGroup.Section.CurriculumCourse.Course.CourseName}" :
                    "Unknown Practice Course";
            }
            else
            {
                // This is a theory schedule, find from enrollments
                var enrollment = enrollments.FirstOrDefault(e => e.Section.SectionId == schedule.Section.SectionId);
                return enrollment != null ?
                    $"{enrollment.Section.CurriculumCourse.Course.CourseCode} - {enrollment.Section.CurriculumCourse.Course.CourseName}" :
                    "Unknown Theory Course";
            }
        }

        // **UPDATED: Enhanced EnrollInSpecificPracticeGroupAsync to include schedule conflict check**
        private async Task<(bool IsSuccess, string GroupName, string ErrorMessage)> EnrollInSpecificPracticeGroupAsync(int studentId, int practiceGroupId)
        {
            try
            {
                // Kiểm tra nhóm thực hành có tồn tại và còn chỗ không
                var practiceGroup = await context.PracticeGroups
                    .Include(pg => pg.Schedules) // Include schedules để kiểm tra xung đột
                        .ThenInclude(sch => sch.ScheduleType)
                    .Include(pg => pg.Section)
                        .ThenInclude(s => s.Semester)
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

                // **ENHANCED: Comprehensive schedule conflict check for practice group**
                var conflictErrors = await CheckPracticeGroupScheduleConflictsForStudentAsync(studentId, practiceGroup);
                if (conflictErrors.Any())
                {
                    return (false, "", string.Join(", ", conflictErrors));
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

        private async Task HandleTuitionFeeCreationAsync(Student student, Section section, Enrollment enrollment)
        {
            // Check if tuition fee already exists for this semester
            var existingTuition = await context.TuitionFees
                .Include(tf => tf.Details)
                .FirstOrDefaultAsync(tf => tf.StudentId == student.Id && 
                                          tf.SemesterId == section.Semester.SemesterId);

            var course = section.CurriculumCourse.Course;
            var credits = course.CreditsTheory + course.CreditsLab;
            var courseAmount = credits * DEFAULT_TUITION_PER_CREDIT;

            if (existingTuition == null)
            {
                // Create new tuition fee for this semester
                var newTuition = new TuitionFee
                {
                    StudentId = student.Id,
                    SemesterId = section.Semester.SemesterId,
                    TotalAmount = courseAmount,
                    PaidAmount = 0,
                    RemainingAmount = courseAmount,
                    Status = TuitionStatus.Pending,
                    DueDate = section.Semester.EndDate.AddDays(30).ToDateTime(TimeOnly.MinValue),
                    CreatedAt = DateTime.Now,
                    IsLate = false,
                };

                context.TuitionFees.Add(newTuition);
                await context.SaveChangesAsync(); // Save to get TuitionFeeId

                // Add course detail
                var tuitionDetail = new TuitionFeeDetail
                {
                    TuitionFeeId = newTuition.TuitionFeeId,
                    SectionId = section.SectionId,
                    ItemName = course.CourseName,
                    ItemType = "Tuition",
                    Credits = credits,
                    UnitPrice = DEFAULT_TUITION_PER_CREDIT,
                    Amount = courseAmount,
                    Description = $"Học phí môn {course.CourseCode} - {course.CourseName}"
                };

                context.TuitionFeeDetails.Add(tuitionDetail);
            }
            else
            {
                // Check if this course is already in the tuition fee
                var existingDetail = existingTuition.Details
                    .FirstOrDefault(d => d.SectionId == section.SectionId);

                if (existingDetail == null)
                {
                    // Add new course to existing tuition fee
                    var tuitionDetail = new TuitionFeeDetail
                    {
                        TuitionFeeId = existingTuition.TuitionFeeId,
                        SectionId = section.SectionId,
                        ItemName = course.CourseName,
                        ItemType = "Tuition",
                        Credits = credits,
                        UnitPrice = DEFAULT_TUITION_PER_CREDIT,
                        Amount = courseAmount,
                        Description = $"Học phí môn {course.CourseCode} - {course.CourseName}"
                    };

                    context.TuitionFeeDetails.Add(tuitionDetail);

                    // Update totals
                    existingTuition.TotalAmount += courseAmount;
                    existingTuition.RemainingAmount += courseAmount;

                    // Update status if it was fully paid before
                    if (existingTuition.Status == TuitionStatus.FullyPaid)
                    {
                        existingTuition.Status = TuitionStatus.PartialPaid;
                        existingTuition.PaidAt = null;
                    }

                    context.TuitionFees.Update(existingTuition);
                }
            }
        }

        private async Task<(bool IsValid, List<string> Errors)> ValidateEnrollmentAsync(Student student, Section section)
        {
            var errors = new List<string>();

            // Kiểm tra section có bị hủy không
            if (section.IsCancelled)
            {
                errors.Add($"Không thể đăng ký vì lớp học phần đã bị hủy. Lý do: {section.CancellationReason}");
                return (false, errors);
            }

            if (section.Schedules == null || !section.Schedules.Any())
            {
                errors.Add("Lớp học phần không có lịch học được thiết lập, vui lòng liên hệ phòng đào tạo.");
                return (false, errors);
            }

            // Check registration period
            var registrationPeriod = await context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                .FirstOrDefaultAsync(rp =>
                    rp.Semester.SemesterId == section.Semester.SemesterId &&
                    rp.Department.DepartmentId == student.Class.Program.Department.DepartmentId);

            if (registrationPeriod == null || !registrationPeriod.IsActive)
            {
                errors.Add("Đăng ký thất bại, khung thời gian đăng ký đã hết hiệu lực");
            }

            var today = DateOnly.FromDateTime(DateTime.Now);

            // Không cho đăng ký sau 7 ngày kể từ ngày bắt đầu học kỳ
            var deadline = section.StartDate.AddDays(7);

            if (today > deadline)
            {
                errors.Add("Không thể đăng ký học phần sau khi học kỳ đã bắt đầu hơn 1 tuần");
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

            return (errors.Count == 0, errors);
        }

        public async Task<IEnumerable<EnrolledSectionResponse>> GetEnrolledSectionsBySemesterAsync(string mssv, int semesterId)
        {
            var enrollments = await context.Enrollments
    .Include(e => e.Student)
        .ThenInclude(s => s.Class)
    .Include(e => e.Section)
        .ThenInclude(s => s.Class)
    .Include(e => e.Section)
        .ThenInclude(s => s.CurriculumCourse)
            .ThenInclude(cc => cc.Course)
    .Include(e => e.Section)
        .ThenInclude(s => s.Lecturer)
            .ThenInclude(l => l.User)
    .Include(e => e.Section)
        .ThenInclude(s => s.Semester)
    .Include(e => e.Section)
        .ThenInclude(s => s.Schedules)
            .ThenInclude(sch => sch.ScheduleType)
    .Where(e =>
        e.Student.MSSV == mssv &&
        e.Section.Semester.SemesterId == semesterId &&
        e.enrollmentStatus != EnrollmentStatus.Dropped)
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
                    SectionStatus = GetSectionStatusInVietnamese(section.Status),
                    
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
                        Message = "Không tìm thấy sinh viên",
                        Errors = { "Sinh viên có MSSV được cung cấp không tồn tại" }
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
                        Message = "Không tìm thấy phần",
                        Errors = { "Học phần yêu cầu không tồn tại" }
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
                        Message = "Không tìm thấy thông tin đăng ký",
                        Errors = { "Sinh viên không được ghi danh vào phần này" }
                    };
                }

                // Kiểm tra có thể hủy đăng ký hay không
                var validationResult = await ValidateDropEnrollmentAsync(student, section, existingEnrollment);
                if (!validationResult.IsValid)
                {
                    return new EnrollmentResultResponse
                    {
                        IsSuccess = false,
                        Message = "Xác thực hủy đăng ký không thành công",
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
                
                // Handle tuition fee adjustment before removing enrollment
                await HandleTuitionFeeAdjustmentAsync(student, section, existingEnrollment);

                context.Enrollments.Remove(existingEnrollment); 
                await context.SaveChangesAsync();
                
                await transaction.CommitAsync();
                return new EnrollmentResultResponse
                {
                    IsSuccess = true,
                    Message = "Đã hủy đăng ký thành công. Học phí đã được cập nhật.",

                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new EnrollmentResultResponse
                {
                    IsSuccess = false,
                    Message = "Hủy đăng ký không thành công do lỗi hệ thống",
                    Errors = { ex.Message }
                };
            }
        }

        private async Task HandleTuitionFeeAdjustmentAsync(Student student, Section section, Enrollment enrollment)
        {
            // Find tuition fee for this semester
            var tuitionFee = await context.TuitionFees
                .Include(tf => tf.Details)
                .Include(tf => tf.Payments)
                .FirstOrDefaultAsync(tf => tf.StudentId == student.Id && 
                                          tf.SemesterId == section.Semester.SemesterId);

            if (tuitionFee != null)
            {
                // Find the detail for this section
                var tuitionDetail = tuitionFee.Details
                    .FirstOrDefault(d => d.SectionId == section.SectionId);

                if (tuitionDetail != null)
                {
                    var courseAmount = tuitionDetail.Amount;

                    // Check if there are any payments
                    if (tuitionFee.PaidAmount > 0)
                    {
                        // If already paid, we need to handle refund or credit
                        if (tuitionFee.PaidAmount >= courseAmount)
                        {
                            // Can refund this course amount
                            tuitionFee.PaidAmount -= courseAmount;
                            tuitionFee.TotalAmount -= courseAmount;
                            
                            // Adjust status
                            if (tuitionFee.RemainingAmount <= 0 && tuitionFee.TotalAmount > 0)
                            {
                                tuitionFee.Status = TuitionStatus.FullyPaid;
                            }
                            else if (tuitionFee.PaidAmount > 0 && tuitionFee.RemainingAmount > 0)
                            {
                                tuitionFee.Status = TuitionStatus.PartialPaid;
                            }
                            else
                            {
                                tuitionFee.Status = TuitionStatus.Pending;
                            }
                        }
                        else
                        {
                            // Partial payment situation - need to adjust carefully
                            tuitionFee.TotalAmount -= courseAmount;
                            tuitionFee.RemainingAmount = tuitionFee.TotalAmount - tuitionFee.PaidAmount;
                            
                            if (tuitionFee.RemainingAmount <= 0)
                            {
                                tuitionFee.Status = TuitionStatus.FullyPaid;
                                tuitionFee.RemainingAmount = 0;
                            }
                            else if (tuitionFee.PaidAmount > 0)
                            {
                                tuitionFee.Status = TuitionStatus.PartialPaid;
                            }
                        }
                    }
                    else
                    {
                        // No payments yet, just remove the amount
                        tuitionFee.TotalAmount -= courseAmount;
                        tuitionFee.RemainingAmount -= courseAmount;
                        
                        if (tuitionFee.TotalAmount <= 0)
                        {
                            // Remove the entire tuition fee if no courses left
                            context.TuitionFeeDetails.Remove(tuitionDetail);
                            context.TuitionFees.Remove(tuitionFee);
                            return;
                        }
                    }

                    // Remove the detail
                    context.TuitionFeeDetails.Remove(tuitionDetail);
                    context.TuitionFees.Update(tuitionFee);
                }
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
                errors.Add("Thời gian hủy đăng ký hiện không còn hiệu lực đối với khoa của bạn.");
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

        private static string GetSectionStatusInVietnamese(SectionStatus status)
        {
            return status switch
            {
                SectionStatus.IsOpening => "Đang mở",
                SectionStatus.IsPreparing => "Đang chuẩn bị",
                SectionStatus.IsClosed => "Đã đóng",
                _ => "Không xác định"
            };
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

        // Helper method để kiểm tra xung đột lịch practice group với lịch của sinh viên trong cùng semester
        private async Task<List<string>> CheckPracticeGroupScheduleConflictsForStudentAsync(int studentId, PracticeGroup practiceGroup)
        {
            var errors = new List<string>();

            // Lấy thông tin semester của practice group
            var practiceGroupSection = await context.PracticeGroups
                .Include(pg => pg.Section)
                    .ThenInclude(s => s.Semester)
                .FirstOrDefaultAsync(pg => pg.PracticeGroupId == practiceGroup.PracticeGroupId);

            if (practiceGroupSection == null)
            {
                return errors;
            }

            var semesterId = practiceGroupSection.Section.Semester.SemesterId;

            // Get ALL schedules của sinh viên trong cùng semester (cả lý thuyết và thực hành hiện tại)
            var studentMainSchedules = await context.Enrollments
                .Include(e => e.Section)
                .Where(e => e.Student.Id == studentId &&
                           e.Section.Semester.SemesterId == semesterId) // Chỉ lấy lịch trong cùng kỳ
                .SelectMany(e => e.Section.Schedules)
                .Where(sch => !sch.PracticeGroupId.HasValue) // Lịch lý thuyết
                .ToListAsync();

            // Get practice group schedules that the student is enrolled in trong cùng semester (excluding current practice group)
            var studentPracticeGroups = await context.PracticeGroupEnrollments
                .Include(pge => pge.PracticeGroup)
                    .ThenInclude(pg => pg.Section)
                .Where(pge => pge.StudentId == studentId &&
                             pge.IsActive &&
                             pge.PracticeGroup.Section.Semester.SemesterId == semesterId && // Cùng kỳ
                             pge.PracticeGroupId != practiceGroup.PracticeGroupId) // Exclude current practice group
                .Select(pge => pge.PracticeGroupId)
                .ToListAsync();

            var studentPracticeSchedules = await context.Schedules
                .Where(s => s.PracticeGroupId.HasValue &&
                           studentPracticeGroups.Contains(s.PracticeGroupId.Value))
                .ToListAsync();

            // Combine ALL student schedules (main + practice) trong cùng semester
            var allStudentSchedules = studentMainSchedules.Concat(studentPracticeSchedules).ToList();

            // Check conflicts với CHÍNH lịch của practiceGroup này vs ALL student schedules
            foreach (var practiceSchedule in practiceGroup.Schedules)
            {
                foreach (var existingSchedule in allStudentSchedules)
                {
                    // Check for time conflicts on the same day
                    if (practiceSchedule.DayOfWeek == existingSchedule.DayOfWeek &&
                        practiceSchedule.DayOfWeek.HasValue &&
                        DoTimesOverlap(practiceSchedule.StartTime, practiceSchedule.EndTime,
                                     existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        var existingScheduleType = existingSchedule.PracticeGroupId.HasValue ?
                            "lịch thực hành khác" : "lịch lý thuyết";
                        errors.Add($"Lịch thực hành bị trùng với {existingScheduleType}: {GetDayOfWeekInVietnamese((DayOfWeek)practiceSchedule.DayOfWeek)} từ {practiceSchedule.StartTime:HH:mm} đến {practiceSchedule.EndTime:HH:mm}");
                    }

                    // Check for conflicts on specific dates
                    if (practiceSchedule.Date.HasValue && existingSchedule.Date.HasValue &&
                        practiceSchedule.Date == existingSchedule.Date &&
                        DoTimesOverlap(practiceSchedule.StartTime, practiceSchedule.EndTime,
                                     existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        var existingScheduleType = existingSchedule.PracticeGroupId.HasValue ?
                            "lịch thực hành khác" : "lịch lý thuyết";
                        errors.Add($"Lịch thực hành bị trùng với {existingScheduleType}: {practiceSchedule.Date:dd/MM/yyyy} từ {practiceSchedule.StartTime:HH:mm} đến {practiceSchedule.EndTime:HH:mm}");
                    }
                }
            }

            return errors;
        }

        private static bool DoTimesOverlap(TimeOnly start1, TimeOnly end1, TimeOnly start2, TimeOnly end2)
        {
            return start1 < end2 && start2 < end1;
        }

        public async Task<PagedResult<EnrollmentListResponse>> GetEnrollmentsWithPaginationAsync(
            PaginationParams pagination,
            string? search = null,
            EnrollmentStatus? enrollmentStatus = null,
            int? semesterId = null)
        {
            var query = context.Enrollments
                .Include(e => e.Student)
                    .ThenInclude(s => s.User)
                .Include(e => e.Student)
                    .ThenInclude(s => s.Class)
                        .ThenInclude(c => c.Program)
                .Include(e => e.Section)
                    .ThenInclude(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                .Include(e => e.Section)
                    .ThenInclude(s => s.Lecturer)
                        .ThenInclude(l => l.User)
                .Include(e => e.Section)
                    .ThenInclude(s => s.Semester)
                .AsQueryable();

            // Apply search filter - tìm kiếm trong MSSV, tên sinh viên, mã lớp học phần, tên môn học
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(e =>
                    e.Student.MSSV.ToLower().Contains(searchTerm) ||
                    e.Student.User.FullName.ToLower().Contains(searchTerm) ||
                    (e.Section.SectionCode != null && e.Section.SectionCode.ToLower().Contains(searchTerm)) ||
                    e.Section.CurriculumCourse.Course.CourseCode.ToLower().Contains(searchTerm) ||
                    e.Section.CurriculumCourse.Course.CourseName.ToLower().Contains(searchTerm));

            }

            // Apply enrollment status filter
            if (enrollmentStatus.HasValue)
            {
                query = query.Where(e => e.enrollmentStatus == enrollmentStatus.Value);
            }

  
            // Apply semester filter
            if (semesterId.HasValue)
            {
                query = query.Where(e => e.Section.Semester.SemesterId == semesterId.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting and pagination
            var enrollments = await query
                .OrderByDescending(e => e.RegisteredAt)
                .ThenBy(e => e.Student.MSSV)
                .ThenBy(e => e.Section.CurriculumCourse.Course.CourseCode)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var enrollmentResponses = enrollments.Select(enrollment => new EnrollmentListResponse
            {
                EnrollmentId = enrollment.EnrollmentId,
                
                // Student information
                StudentId = enrollment.Student.Id,
                MSSV = enrollment.Student.MSSV,
                StudentName = enrollment.Student.User.FullName,
                ClassName = enrollment.Student.Class.ClassName,
                ProgramName = enrollment.Student.Class.Program.ProgramName,
                
                // Section information
                SectionId = enrollment.Section.SectionId,
                SectionCode = enrollment.Section.SectionCode ?? $"LHP{enrollment.Section.SectionId}",
                
                // Course information
                CourseId = enrollment.Section.CurriculumCourse.Course.CourseId,
                CourseCode = enrollment.Section.CurriculumCourse.Course.CourseCode,
                CourseName = enrollment.Section.CurriculumCourse.Course.CourseName,
                CreditsTheory = enrollment.Section.CurriculumCourse.Course.CreditsTheory,
                CreditsLab = enrollment.Section.CurriculumCourse.Course.CreditsLab,
                TotalCredits = enrollment.Section.CurriculumCourse.Course.CreditsTheory + 
                            enrollment.Section.CurriculumCourse.Course.CreditsLab,
                
                // Lecturer information
                LecturerName = enrollment.Section.Lecturer?.User?.FullName ?? "Not Assigned",
                LecturerCode = enrollment.Section.Lecturer?.LecturerCode ?? "",
                
                // Semester information
                SemesterId = enrollment.Section.Semester.SemesterId,
                SemesterName = $"{enrollment.Section.Semester.Year} - {enrollment.Section.Semester.Term}",
                
                // Enrollment information
                EnrollmentStatus = enrollment.enrollmentStatus.ToString(),
                EnrollmentStatusVietnamese = GetEnrollmentStatusInVietnamese(enrollment.enrollmentStatus),
                RegisteredAt = enrollment.RegisteredAt,
                
                // Additional section information
                SectionCapacity = enrollment.Section.Capacity,
                SectionEnrolledCount = enrollment.Section.EnrolledCount,
                SectionStartDate = enrollment.Section.StartDate,
                SectionEndDate = enrollment.Section.EndDate
                
            }).ToList();

            return new PagedResult<EnrollmentListResponse>
            {
                Items = enrollmentResponses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }
    }
}