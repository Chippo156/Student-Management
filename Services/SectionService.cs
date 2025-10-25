using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class SectionService(AppDbContext context) : ISectionService
    {
        public async Task<Section> CreateSectionAsync(SectionRequest request)
        {
            var curriculumCourse = await context.CurriculumCourses.FindAsync(request.CurriculumCourseId);
            if (curriculumCourse is null)
            {
                throw new Exception("CurriculumCourse not found");
            }

            var lecturer = await context.Lecturers.FindAsync(request.LecturerId);
            if (lecturer is null)
            {
                throw new Exception("Lecturer not found");
            }

            Semester? existingSemester = await context.Semesters.FindAsync(request.SemesterId);
            if (existingSemester is null)
            {
                throw new Exception("Semester not found");
            }

            var classSection = await context.Classes.FindAsync(request.ClassId);

            if (classSection is null)
            {
                throw new Exception("Class not found");
            }


            Section newSection = new Section
            {
                CurriculumCourse = curriculumCourse,
                Lecturer = lecturer,
                Semester = existingSemester,
                Class = classSection,
            };

            context.Sections.Add(newSection);
            await context.SaveChangesAsync();
            return newSection;
        }

        public async Task<bool> DeleteSectionAsync(int sectionId)
        {
            var section = await context.Sections.FindAsync(sectionId);
            if (section is null)
            {
                return false;
            }

            context.Sections.Remove(section);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Section>> GetAllSectionsAsync()
        {
            return await context.Sections
                .Include(s => s.CurriculumCourse)
                .Include(s => s.Lecturer)
                .Include(s => s.Semester)
                .ToListAsync();
        }

        public async Task<Section?> GetSectionByIdAsync(int sectionId)
        {
            return await context.Sections
                .Include(s => s.CurriculumCourse)
                .Include(s => s.Lecturer)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);
        }

        public async Task<IEnumerable<Section>> GetSectionsByCourseAsync(int courseId)
        {
            return await context.Sections
                .Include(s => s.CurriculumCourse)
                .Include(s => s.Lecturer)
                .Where(s => s.CurriculumCourse.Course.CourseId == courseId)
                .ToListAsync();
        }

        public Task<IEnumerable<Section>> GetSectionsByLecturerAsync(int lecturerId)
        {
            return Task.FromResult(context.Sections
                .Include(s => s.CurriculumCourse)
                .Where(s => s.Lecturer.Id == lecturerId)
                .AsEnumerable());
        }

        public async Task<IEnumerable<SectionDetailWithRegistrationResponse>> GetSectionsByCurriculumCourseAndSemesterAsync(int curriculumCourseId, int semesterId, string studentMSSV)
        {
            // Get student to determine their department
            var student = await context.Students
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                .FirstOrDefaultAsync(s => s.MSSV == studentMSSV)
                ?? throw new Exception($"Student with MSSV {studentMSSV} not found");

            // Verify curriculum course exists
            var curriculumCourse = await context.CurriculumCourses
                .Include(cc => cc.Course)
                .Include(cc => cc.Program)
                .FirstOrDefaultAsync(cc => cc.Id == curriculumCourseId)
                ?? throw new Exception("Curriculum course not found");

            // Check if registration period is active for the student's department and semester
            var registrationPeriod = await context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                .FirstOrDefaultAsync(rp => 
                    rp.Semester.SemesterId == semesterId && 
                    rp.Department.DepartmentId == student.Class.Program.Department.DepartmentId);

            bool isRegistrationOpen = registrationPeriod?.IsActive ?? false;

            // Get all sections for this curriculum course in the specified semester
            var sections = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .Include(s => s.Semester)
                .Where(s => s.CurriculumCourse.Id == curriculumCourseId && 
                        s.Semester.SemesterId == semesterId)
                .ToListAsync();

            var response = sections.Select(s => new SectionDetailWithRegistrationResponse
            {
                SectionId = s.SectionId,
                MaxCapacity = s.Capacity,
                CurrentEnrollment = s.EnrolledCount,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                
                // Course information
                CourseCode = s.CurriculumCourse.Course.CourseCode,
                CourseName = s.CurriculumCourse.Course.CourseName,
                CreditsTheory = s.CurriculumCourse.Course.CreditsTheory,
                CreditsLab = s.CurriculumCourse.Course.CreditsLab,
                TotalCredits = s.CurriculumCourse.Course.CreditsTheory + s.CurriculumCourse.Course.CreditsLab,
                
                // Lecturer information
                LecturerName = s.Lecturer?.User?.FullName ?? "Not Assigned",
                LecturerEmail = s.Lecturer?.User?.Email ?? "",
                
                // Semester information
                SemesterId = s.Semester.SemesterId,
                SemesterName = $"{s.Semester.Year} - {s.Semester.Term}",
                Year = s.Semester.Year,
                Term = s.Semester.Term,
                
                // Registration status
                IsRegistrationOpen = isRegistrationOpen,
                RegistrationStartDate = registrationPeriod?.StartDate,
                RegistrationEndDate = registrationPeriod?.EndDate
            })
            .OrderBy(s => s.SectionName)
            .ToList();

            return response;
        }

        public async Task<SectionScheduleWithRegistrationResponse?> GetSectionScheduleWithRegistrationAsync(int sectionId, string studentMSSV)
        {
            // Get student to determine their department
            var student = await context.Students
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                .FirstOrDefaultAsync(s => s.MSSV == studentMSSV)
                ?? throw new Exception($"Student with MSSV {studentMSSV} not found");

            // Get section with related data
            var section = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .Include(s => s.Semester)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);

            if (section == null)
                return null;

            // Check if registration period is active for the student's department and semester
            var registrationPeriod = await context.RegistrationPeriods
                .Include(rp => rp.Semester)
                .Include(rp => rp.Department)
                .FirstOrDefaultAsync(rp => 
                    rp.Semester.SemesterId == section.Semester.SemesterId && 
                    rp.Department.DepartmentId == student.Class.Program.Department.DepartmentId);

            bool isRegistrationOpen = registrationPeriod?.IsActive ?? false;

            // Get all schedules for this section
            var schedules = await context.Schedules
                .Include(sch => sch.ScheduleType)
                .Where(sch => sch.Section.SectionId == sectionId)
                .OrderBy(sch => sch.DayOfWeek)
                .ThenBy(sch => sch.StartTime)
                .ThenBy(sch => sch.Date)
                .ToListAsync();

            var scheduleDetails = schedules.Select(sch => new ScheduleDetailInfo
            {
                ScheduleId = sch.ScheduleId,
                ScheduleTypeName = sch.ScheduleType.Name,
                DayOfWeek = sch.DayOfWeek,
                DayOfWeekName = sch.DayOfWeek?.ToString() ?? "",
                Date = sch.Date,
                StartTime = sch.StartTime,
                EndTime = sch.EndTime,
                Room = sch.Room,
                OnlineLink = sch.OnlineLink
            }).ToList();

            return new SectionScheduleWithRegistrationResponse
            {
                SectionId = section.SectionId,
                CourseCode = section.CurriculumCourse.Course.CourseCode,
                CourseName = section.CurriculumCourse.Course.CourseName,
                LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",
                SemesterId = section.Semester.SemesterId,
                SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
                
                // Registration status
                IsRegistrationOpen = isRegistrationOpen,
                RegistrationStartDate = registrationPeriod?.StartDate,
                RegistrationEndDate = registrationPeriod?.EndDate,
                
                Schedules = scheduleDetails
            };
        }
    }
}