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
                    .ThenInclude(s => s.CurriculumCourse)
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
                        Errors = { "Student is already enrolled in this section" }
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
                        Errors = { "Student is already enrolled in another section of this course in the same semester" }
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
                await context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Create successful response
                return new EnrollmentResultResponse
                {
                    IsSuccess = true,
                    Message = "Successfully enrolled in course",
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

            // Check if section is full
            if (enrollments.Count >= section.Capacity)
            {
                errors.Add("Section is full");
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
                        errors.Add($"Prerequisite not met: {prerequisite.PrerequisiteCourse.CourseCode} - {prerequisite.PrerequisiteCourse.CourseName}");
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
                        errors.Add($"Schedule conflict: {newSchedule.DayOfWeek} {newSchedule.StartTime}-{newSchedule.EndTime}");
                    }

                    // Check for conflicts on specific dates
                    if (newSchedule.Date.HasValue && existingSchedule.Date.HasValue &&
                        newSchedule.Date == existingSchedule.Date &&
                        DoTimesOverlap(newSchedule.StartTime, newSchedule.EndTime,
                                     existingSchedule.StartTime, existingSchedule.EndTime))
                    {
                        errors.Add($"Schedule conflict on {newSchedule.Date}: {newSchedule.StartTime}-{newSchedule.EndTime}");
                    }
                }
            }

            return (errors.Count == 0, errors);
        }

        private static bool DoTimesOverlap(TimeOnly start1, TimeOnly end1, TimeOnly start2, TimeOnly end2)
        {
            return start1 < end2 && start2 < end1;
        }
    }
}