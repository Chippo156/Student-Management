using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
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
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                // Validate CurriculumCourse exists and is active
                var curriculumCourse = await context.CurriculumCourses
                    .Include(cc => cc.Course)
                    .Include(cc => cc.Program)
                        .ThenInclude(p => p.Department)
                    .FirstOrDefaultAsync(cc => cc.Id == request.CurriculumCourseId);

                if (curriculumCourse == null)
                {
                    throw new Exception("CurriculumCourse not found");
                }

                // Validate Lecturer exists and is active
                var lecturer = await context.Lecturers
                    .Include(l => l.User)
                    .FirstOrDefaultAsync(l => l.Id == request.LecturerId);

                if (lecturer == null)
                {
                    throw new Exception("Lecturer not found");
                }

                // Check if lecturer is active
                if (lecturer.User.AccountStatus != Enum.AccountStatus.Active)
                {
                    throw new Exception("Cannot assign inactive lecturer to section");
                }

                // Validate Semester exists and is not in the past
                var existingSemester = await context.Semesters
                    .FirstOrDefaultAsync(s => s.SemesterId == request.SemesterId);

                if (existingSemester == null)
                {
                    throw new Exception("Semester not found");
                }

                // Check if semester is not too far in the past (optional business rule)
                var currentDate = DateOnly.FromDateTime(DateTime.Now);
                if (existingSemester.EndDate < currentDate.AddDays(-30)) // Allow 30 days grace period
                {
                    throw new Exception("Cannot create section for semester that ended more than 30 days ago");
                }

                // Validate Class exists
                var classSection = await context.Classes
                    .Include(c => c.Program)
                        .ThenInclude(p => p.Department)
                    .FirstOrDefaultAsync(c => c.ClassId == request.ClassId);

                if (classSection == null)
                {
                    throw new Exception("Class not found");
                }

                // Validate that the class program matches the curriculum course program
                if (classSection.Program.AcademicProgramId != curriculumCourse.Program.AcademicProgramId)
                {
                    throw new Exception("Class program does not match curriculum course program");
                }

                // Validate capacity
                if (request.Capacity <= 0)
                {
                    throw new Exception("Section capacity must be greater than 0");
                }

                if (request.Capacity > 200) // Max capacity validation
                {
                    throw new Exception("Section capacity cannot exceed 200 students");
                }

                // Validate dates
                if (request.StartDate >= request.EndDate)
                {
                    throw new Exception("Start date must be before end date");
                }

                // Check for date conflicts with semester
                if (request.StartDate < existingSemester.StartDate || request.EndDate > existingSemester.EndDate)
                {
                    throw new Exception("Section dates must be within semester dates");
                }

                // Generate unique section code
                string baseSectionCode = $"LHP{curriculumCourse.Course.CourseCode}-{existingSemester.Year}{existingSemester.Term}-{classSection.ClassCode}";
                string sectionCode = await GenerateUniqueSectionCodeAsync(baseSectionCode);

                // Check for potential conflicts with existing sections
                await ValidateNoScheduleConflictsAsync(request, lecturer.Id);

                // Create the new section
                var newSection = new Section
                {
                    SectionCode = sectionCode,
                    CurriculumCourse = curriculumCourse,
                    Lecturer = lecturer,
                    Semester = existingSemester,
                    Class = classSection,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    Capacity = request.Capacity,
                    Status = SectionStatus.IsPreparing,
                    EnrolledCount = 0,

                    // Initialize minimum enrollment settings with defaults if not provided
                    MinEnrollment = request.MinEnrollment ?? 8,
                    MinEnrollmentPercentage = request.MinEnrollmentPercentage ?? 0.5,

                    IsCancelled = false,
                    CancelledAt = null,
                    CancellationReason = null
                };

                context.Sections.Add(newSection);
                await context.SaveChangesAsync();

                await transaction.CommitAsync();
                return newSection;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                throw;
            }
        }

        // Helper method to generate unique section code
        private async Task<string> GenerateUniqueSectionCodeAsync(string baseSectionCode)
        {
            string sectionCode = baseSectionCode;
            int counter = 1;

            // Check if the base code already exists
            while (await context.Sections.AnyAsync(s => s.SectionCode == sectionCode))
            {
                sectionCode = $"{baseSectionCode}-{counter:D2}"; // Add suffix like -01, -02, etc.
                counter++;

                if (counter > 99) // Prevent infinite loop
                {
                    throw new Exception("Unable to generate unique section code after 99 attempts");
                }
            }

            return sectionCode;
        }

        // Helper method to validate no schedule conflicts for lecturer
        private async Task ValidateNoScheduleConflictsAsync(SectionRequest request, int lecturerId)
        {
            // This is a placeholder for schedule conflict validation
            // You would implement this based on your scheduling requirements

            // Example: Check if lecturer has conflicting schedules in the same semester
            var existingLecturerSections = await context.Sections
                .Where(s => s.Lecturer.Id == lecturerId &&
                           s.Semester.SemesterId == request.SemesterId &&
                           !s.IsCancelled &&
                           s.Status != SectionStatus.IsClosed)
                .CountAsync();

            // Example business rule: Lecturer can't have more than 10 sections per semester
            if (existingLecturerSections >= 10)
            {
                throw new Exception("Lecturer cannot be assigned more than 10 sections per semester");
            }
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

        public async Task<SectionListResponse?> GetSectionByIdAsync(int sectionId)
        {
            var section = await context.Sections
                .Include(s => s.CurriculumCourse)
                  .ThenInclude(cc => cc.Course)

                .Include(s => s.Lecturer)
                  .ThenInclude(l => l.User)
                .Include(s => s.Semester)
                .Include(s => s.Class)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);

            if (section == null)
                return null;
            return new SectionListResponse
            {
                SectionId = section.SectionId,
                SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                CourseCode = section.CurriculumCourse.Course.CourseCode,
                CourseName = section.CurriculumCourse.Course.CourseName,
                CreditsTheory = section.CurriculumCourse.Course.CreditsTheory,
                CreditsLab = section.CurriculumCourse.Course.CreditsLab,
                TotalCredits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,
                LecturerName = section.Lecturer?.User?.FullName ?? "Chưa phân công",
                StartDate = section.StartDate,
                EndDate = section.EndDate,
                Capacity = section.Capacity,
                EnrolledCount = section.EnrolledCount,
                Status = section.Status,
                StatusName = GetSectionStatusInVietnamese(section.Status),
                LecturerEmail = section.Lecturer.User.Email,
                IsActive = section.Status != SectionStatus.IsClosed,
                ClassName =  section.Class.ClassName,
                SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
            };
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
                .Include(s => s.Class)
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
                RegistrationEndDate = registrationPeriod?.EndDate,
                Status = s.Status,

                ClassName = s.Class.ClassName,
                ClassCode = s.Class.ClassCode
                
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

            // Get main schedules for this section (không bao gồm lịch thực hành của nhóm)
            var mainSchedules = await context.Schedules
                .Include(sch => sch.ScheduleType)
                .Where(sch => sch.Section.SectionId == sectionId && !sch.PracticeGroupId.HasValue && sch.ScheduleType.ScheduleTypeId != 3)
                .OrderBy(sch => sch.DayOfWeek)
                .ThenBy(sch => sch.StartTime)
                .ThenBy(sch => sch.Date)
                .ToListAsync();

            // Get practice groups for this section
            var practiceGroups = await context.PracticeGroups
                .Include(pg => pg.Schedules)
                    .ThenInclude(s => s.ScheduleType)
                .Include(pg => pg.PracticeGroupEnrollments)
                    .ThenInclude(pge => pge.Student)
                .Where(pg => pg.SectionId == sectionId && pg.IsActive)
                .ToListAsync();

            // Check if student is enrolled in any practice group
            var studentPracticeGroup = practiceGroups
                .FirstOrDefault(pg => pg.PracticeGroupEnrollments
                    .Any(pge => pge.StudentId == student.Id && pge.IsActive));

            var scheduleDetails = mainSchedules.Select(sch => new ScheduleDetailInfo
            {
                ScheduleId = sch.ScheduleId,
                ScheduleTypeName = sch.ScheduleType.Name,
                DayOfWeek = sch.DayOfWeek,
                DayOfWeekName = GetDayOfWeekInVietnamese(sch.DayOfWeek),
                Date = sch.Date,
                StartTime = sch.StartTime,
                EndTime = sch.EndTime,
                Room = sch.Room,
                OnlineLink = sch.OnlineLink,
                PracticeGroupName = null // Main schedules don't belong to practice groups
            }).ToList();

            // Add practice group schedules if student is enrolled in a practice group
            if (studentPracticeGroup != null)
            {
                var practiceSchedules = studentPracticeGroup.Schedules.Select(sch => new ScheduleDetailInfo
                {
                    ScheduleId = sch.ScheduleId,
                    ScheduleTypeName = sch.ScheduleType.Name,
                    DayOfWeek = sch.DayOfWeek,
                    DayOfWeekName = GetDayOfWeekInVietnamese(sch.DayOfWeek),
                    Date = sch.Date,
                    StartTime = sch.StartTime,
                    EndTime = sch.EndTime,
                    Room = sch.Room,
                    OnlineLink = sch.OnlineLink,
                    PracticeGroupName = studentPracticeGroup.GroupName
                });

                scheduleDetails.AddRange(practiceSchedules);
            }

            // Sort all schedules
            scheduleDetails = scheduleDetails
                .OrderBy(sch => sch.DayOfWeek)
                .ThenBy(sch => sch.StartTime)
                .ThenBy(sch => sch.Date)
                .ToList();

            // Create practice group info for response
            var practiceGroupInfo = practiceGroups.Select(pg => new PracticeGroupInfo
            {
                PracticeGroupId = pg.PracticeGroupId,
                GroupName = pg.GroupName,
                Description = pg.Description ?? "",
                MaxCapacity = pg.MaxCapacity,
                CurrentCount = pg.CurrentCount,
                IsAvailable = pg.CurrentCount < pg.MaxCapacity,
                IsStudentEnrolled = pg.PracticeGroupEnrollments.Any(pge => pge.StudentId == student.Id && pge.IsActive),
                Schedules = pg.Schedules.Select(s => new PracticeScheduleInfo
                {
                    ScheduleId = s.ScheduleId,
                    DayOfWeek = GetDayOfWeekInVietnamese(s.DayOfWeek),
                    Date = s.Date,
                    TimeSlot = $"{s.StartTime:HH:mm} - {s.EndTime:HH:mm}",
                    Room = s.Room,
                    ScheduleType = s.ScheduleType.Name
                }).ToList()
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

                // Course credits info
                CreditsTheory = section.CurriculumCourse.Course.CreditsTheory,
                CreditsLab = section.CurriculumCourse.Course.CreditsLab,
                HasPracticeGroups = section.CurriculumCourse.Course.CreditsLab > 0 && practiceGroups.Any(),

                Schedules = scheduleDetails,
                PracticeGroups = practiceGroupInfo,
                StudentCurrentPracticeGroup = studentPracticeGroup != null ? new StudentPracticeGroupInfo
                {
                    PracticeGroupId = studentPracticeGroup.PracticeGroupId,
                    GroupName = studentPracticeGroup.GroupName,
                    Description = studentPracticeGroup.Description ?? ""
                } : null
            };
        }

        public async Task<PagedResult<SectionListResponse>> GetSectionsWithPaginationAsync(SectionSearchRequest searchRequest)
        {
            var query = context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Program)
                        .ThenInclude(p => p.Department)
                            .ThenInclude(d => d.Faculty)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .Include(s => s.Semester)
                .Include(s => s.Class)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(searchRequest.SectionCode))
            {
                query = query.Where(s => s.SectionCode != null && s.SectionCode.Contains(searchRequest.SectionCode.Trim()));
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.CourseName))
            {
                query = query.Where(s => s.CurriculumCourse.Course.CourseName.Contains(searchRequest.CourseName.Trim()));
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.LecturerName))
            {
                query = query.Where(s => s.Lecturer != null && s.Lecturer.User.FullName.Contains(searchRequest.LecturerName.Trim()));
            }

            if (searchRequest.SemesterId.HasValue)
            {
                query = query.Where(s => s.Semester.SemesterId == searchRequest.SemesterId.Value);
            }

            if (searchRequest.DepartmentId.HasValue)
            {
                query = query.Where(s => s.CurriculumCourse.Program.Department.DepartmentId == searchRequest.DepartmentId.Value);
            }

            if (searchRequest.CourseId.HasValue)
            {
                query = query.Where(s => s.CurriculumCourse.Course.CourseId == searchRequest.CourseId.Value);
            }

            if (searchRequest.Status.HasValue)
            {
                query = query.Where(s => s.Status == searchRequest.Status.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = searchRequest.SortBy?.ToLower() switch
            {
                "sectioncode" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.SectionCode)
                    : query.OrderBy(s => s.SectionCode),
                "coursename" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.CurriculumCourse.Course.CourseName)
                    : query.OrderBy(s => s.CurriculumCourse.Course.CourseName),
                "startdate" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.StartDate)
                    : query.OrderBy(s => s.StartDate),
                "capacity" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Capacity)
                    : query.OrderBy(s => s.Capacity),
                "enrolledcount" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.EnrolledCount)
                    : query.OrderBy(s => s.EnrolledCount),
                "lecturer" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Lecturer.User.FullName)
                    : query.OrderBy(s => s.Lecturer.User.FullName),
                "semester" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Semester.Year).ThenByDescending(s => s.Semester.Term)
                    : query.OrderBy(s => s.Semester.Year).ThenBy(s => s.Semester.Term),
                _ => query.OrderBy(s => s.SectionCode ?? "").ThenBy(s => s.CurriculumCourse.Course.CourseName)
            };

            // Apply pagination
            var sections = await query
                .Skip((searchRequest.PageNumber - 1) * searchRequest.PageSize)
                .Take(searchRequest.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var responses = await MapToSectionListResponsesAsync(sections);

            return new PagedResult<SectionListResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = searchRequest.PageNumber,
                PageSize = searchRequest.PageSize
            };
        }

        public async Task<PagedResult<SectionListResponse>> GetAllSectionsWithPaginationAsync(
            PaginationParams pagination,
            string? search = null,
            SectionStatus? status = null,
            int? semesterId = null)
        {
            var query = context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Program)
                        .ThenInclude(p => p.Department)
                            .ThenInclude(d => d.Faculty)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .Include(s => s.Semester)
                .Include(s => s.Class)
                .AsQueryable();

            // Apply search filter - tìm kiếm trong mã lớp học phần, tên môn học, tên giảng viên
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(s => 
                    (s.SectionCode != null && s.SectionCode.ToLower().Contains(searchTerm)) ||
                    s.CurriculumCourse.Course.CourseName.ToLower().Contains(searchTerm) ||
                    s.CurriculumCourse.Course.CourseCode.ToLower().Contains(searchTerm) ||
                    (s.Lecturer != null && s.Lecturer.User.FullName.ToLower().Contains(searchTerm)));
            }

            // Apply status filter
            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }

            // Apply semester filter
            if (semesterId.HasValue)
            {
                query = query.Where(s => s.Semester.SemesterId == semesterId.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting (default sort by semester, then course name)
            query = query
                .OrderByDescending(s => s.Semester.Year)
                .ThenByDescending(s => s.Semester.Term)
                .ThenBy(s => s.CurriculumCourse.Course.CourseName)
                .ThenBy(s => s.SectionCode ?? "");

            // Apply pagination
            var sections = await query
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var responses = await MapToSectionListResponsesAsync(sections);

            return new PagedResult<SectionListResponse>
            {
                Items = responses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        private async Task<List<SectionListResponse>> MapToSectionListResponsesAsync(List<Section> sections)
        {
            var responses = new List<SectionListResponse>();

            foreach (var section in sections)
            {
                // Get schedule summary
                var schedules = await context.Schedules
                    .Include(sch => sch.ScheduleType)
                    .Where(sch => sch.Section.SectionId == section.SectionId && !sch.PracticeGroupId.HasValue)
                    .OrderBy(sch => sch.DayOfWeek)
                    .ThenBy(sch => sch.StartTime)
                    .ToListAsync();

                var scheduleSummary = string.Join(", ", schedules
                    .Where(sch => sch.DayOfWeek.HasValue)
                    .Select(sch => $"{GetDayOfWeekInVietnamese(sch.DayOfWeek.Value)} {sch.StartTime:HH:mm}-{sch.EndTime:HH:mm}"));

                var roomSummary = string.Join(", ", schedules
                    .Where(sch => !string.IsNullOrEmpty(sch.Room))
                    .Select(sch => sch.Room)
                    .Distinct());

                // Get practice groups count
                var practiceGroupCount = await context.PracticeGroups
                    .CountAsync(pg => pg.SectionId == section.SectionId && pg.IsActive);

                var availableSlots = Math.Max(0, section.Capacity - section.EnrolledCount);
                var enrollmentPercentage = section.Capacity > 0 ? 
                    Math.Round((decimal)section.EnrolledCount / section.Capacity * 100, 2) : 0;

                responses.Add(new SectionListResponse
                {
                    SectionId = section.SectionId,
                    SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                    Status = section.Status,
                    StatusName = GetSectionStatusInVietnamese(section.Status),
                    
                    // Course information
                    CourseId = section.CurriculumCourse.Course.CourseId,
                    CourseCode = section.CurriculumCourse.Course.CourseCode,
                    CourseName = section.CurriculumCourse.Course.CourseName,
                    CreditsTheory = section.CurriculumCourse.Course.CreditsTheory,
                    CreditsLab = section.CurriculumCourse.Course.CreditsLab,
                    TotalCredits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,
                    
                    // Lecturer information
                    LecturerId = section.Lecturer?.Id,
                    LecturerName = section.Lecturer?.User?.FullName ?? "Chưa phân công",
                    LecturerEmail = section.Lecturer?.User?.Email ?? "",
                    
                    // Class information
                    ClassId = section.Class.ClassId,
                    ClassName = section.Class.ClassName,
                    ClassCode = section.Class.ClassCode,
                    
                    // Semester information
                    SemesterId = section.Semester.SemesterId,
                    SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",
                    Year = section.Semester.Year,
                    Term = section.Semester.Term,
                    
                    // Section details
                    StartDate = section.StartDate,
                    EndDate = section.EndDate,
                    Capacity = section.Capacity,
                    EnrolledCount = section.EnrolledCount,
                    AvailableSlots = availableSlots,
                    EnrollmentPercentage = enrollmentPercentage,
                    
                    // Department information
                    DepartmentName = section.CurriculumCourse.Program.Department.DepartmentName,
                    FacultyName = section.CurriculumCourse.Program.Department.Faculty.FacultyName,
                    
                    // Schedule summary
                    ScheduleSummary = scheduleSummary,
                    RoomSummary = roomSummary,
                    
                    // Practice groups info
                    PracticeGroupCount = practiceGroupCount,
                    HasPracticeGroups = section.CurriculumCourse.Course.CreditsLab > 0 && practiceGroupCount > 0,
                    
                    // Additional info
                    CreatedAt = DateTime.Now, // Add if you have CreatedAt field
                    IsActive = section.Status != SectionStatus.IsClosed
                });
            }

            return responses;
        }

        public async Task<PagedResult<SectionSimpleResponse>> GetSectionsByLecturerAsync(SectionSearchRequest searchRequest, string lecturerCode)
        {
            var query = context.Sections
                .Include(s => s.CurriculumCourse.Course)
                .Include(s => s.Lecturer.User)
                .Include(s => s.Semester)
                .Where(s => s.Lecturer != null && s.Lecturer.User.Username == lecturerCode)
                .AsQueryable();

            // Apply filters (same as before)
            if (!string.IsNullOrWhiteSpace(searchRequest.SectionCode))
                query = query.Where(s => s.SectionCode != null && s.SectionCode.Contains(searchRequest.SectionCode.Trim()));

            if (!string.IsNullOrWhiteSpace(searchRequest.CourseName))
                query = query.Where(s => s.CurriculumCourse.Course.CourseName.Contains(searchRequest.CourseName.Trim()));

            if (!string.IsNullOrWhiteSpace(searchRequest.LecturerName))
                query = query.Where(s => s.Lecturer != null && s.Lecturer.User.FullName.Contains(searchRequest.LecturerName.Trim()));

            if (searchRequest.SemesterId.HasValue)
                query = query.Where(s => s.Semester.SemesterId == searchRequest.SemesterId.Value);

            if (searchRequest.Status.HasValue)
                query = query.Where(s => s.Status == searchRequest.Status.Value);


            var totalCount = await query.CountAsync();

            // Apply sorting
            query = searchRequest.SortBy?.ToLower() switch
            {
                "coursename" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.CurriculumCourse.Course.CourseName)
                    : query.OrderBy(s => s.CurriculumCourse.Course.CourseName),
                "semester" => searchRequest.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(s => s.Semester.Year).ThenByDescending(s => s.Semester.Term)
                    : query.OrderBy(s => s.Semester.Year).ThenBy(s => s.Semester.Term),
                _ => query.OrderBy(s => s.SectionCode ?? "").ThenBy(s => s.CurriculumCourse.Course.CourseName)
            };

            var sections = await query
                .Skip((searchRequest.PageNumber - 1) * searchRequest.PageSize)
                .Take(searchRequest.PageSize)
                .Select(s => new SectionSimpleResponse
                {
                    SectionId = s.SectionId,
                    SectionCode = s.SectionCode ?? $"LHP{s.SectionId}",
                    CourseCode = s.CurriculumCourse.Course.CourseCode,
                    CourseName = s.CurriculumCourse.Course.CourseName,
                    LecturerName = s.Lecturer != null ? s.Lecturer.User.FullName : "Chưa phân công",
                    SemesterName = $"{s.Semester.Year} - {s.Semester.Term}",
                    Capacity = s.Capacity,
                    EnrolledCount = s.EnrolledCount,
                    AvailableSlots = Math.Max(0, s.Capacity - s.EnrolledCount),
                    Status = s.Status,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate
                })
                .ToListAsync();

            return new PagedResult<SectionSimpleResponse>
            {
                Items = sections,
                TotalCount = totalCount,
                PageNumber = searchRequest.PageNumber,
                PageSize = searchRequest.PageSize
            };
        }

        public async Task<IEnumerable<SectionDropdownResponse>> GetSectionDropdownForLecturerAsync(string lecturerCode, int? semesterId = null)
        {
            // Verify lecturer exists
            var lecturer = await context.Lecturers
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.User.Username == lecturerCode);

            if (lecturer == null)
            {
                throw new Exception("Lecturer not found");
            }

            // Build query for sections taught by this lecturer
            var query = context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Semester)
                .Include(s => s.Class)
                .Where(s => s.Lecturer.Id == lecturer.Id);

            // Filter by semester if specified
            if (semesterId.HasValue)
            {
                query = query.Where(s => s.Semester.SemesterId == semesterId.Value);
            }

            // Get sections and map to dropdown response
            var sections = await query
                .OrderByDescending(s => s.Semester.Year)
                .ThenByDescending(s => s.Semester.Term)
                .ThenBy(s => s.CurriculumCourse.Course.CourseCode)
                .ThenBy(s => s.SectionCode)
                .ToListAsync();

            var result = sections.Select(section => new SectionDropdownResponse
            {
                SectionId = section.SectionId,
                DisplayName = $"{section.CurriculumCourse.Course.CourseCode} - {section.CurriculumCourse.Course.CourseName} ({section.SectionCode ?? $"LHP{section.SectionId}"})",
                ClassName = section.Class.ClassName
            }).ToList();

            return result;
        }

        public async Task<PagedResult<SectionSimpleResponse>> GetSectionsIsStartingByLecturerAsync(string lecturerCode)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var currentTime = TimeOnly.FromDateTime(DateTime.Now);

            var query = context.Sections
                .Include(s => s.CurriculumCourse.Course)
                .Include(s => s.Lecturer.User)
                .Include(s => s.Semester)
                .Include(s => s.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .Where(s => s.Lecturer != null &&
                           s.Lecturer.User.Username == lecturerCode &&
                           s.StartDate <= today &&
                           s.EndDate >= today && // Section đang trong thời gian học
                           s.Status == SectionStatus.IsOpening) // Chỉ lấy sections đang mở
                .AsQueryable();
            var sections = query
                .Select(s => new SectionSimpleResponse
                {
                    SectionId = s.SectionId,
                    SectionCode = s.SectionCode ?? $"LHP{s.SectionId}",
                    CourseCode = s.CurriculumCourse.Course.CourseCode,
                    CourseName = s.CurriculumCourse.Course.CourseName,
                    LecturerName = s.Lecturer != null ? s.Lecturer.User.FullName : "Chưa phân công",
                    SemesterName = $"{s.Semester.Year} - {s.Semester.Term}",
                    Capacity = s.Capacity,
                    EnrolledCount = s.EnrolledCount,
                    AvailableSlots = Math.Max(0, s.Capacity - s.EnrolledCount),
                    Status = s.Status,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,

                })
                .ToList();

            return new PagedResult<SectionSimpleResponse>
            {
                Items = sections,
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

        // Helper method để convert DayOfWeek sang tiếng Việt
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
        public async Task<SectionDetailWithScheduleResponse?> GetSectionDetailWithScheduleAsync(
    int sectionId,
    bool isPracticeSchedule = false,
    int? practiceGroupId = null)
        {
            // Lấy thông tin section với các related data
            var section = await context.Sections
                .Include(s => s.CurriculumCourse)
                    .ThenInclude(cc => cc.Course)
                .Include(s => s.Lecturer)
                    .ThenInclude(l => l.User)
                .Include(s => s.Semester)
                .Include(s => s.Class)
                .Include(s => s.Schedules)
                    .ThenInclude(sch => sch.ScheduleType)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);

            if (section == null)
                return null;

            List<BasicStudentInfo> students;
            List<ScheduleInfoSectionDetail> schedules;
            PracticeGroupInfoWithSection? practiceGroupInfo = null;

            if (isPracticeSchedule)
            {
                // Lấy thông tin thực hành
                if (practiceGroupId.HasValue)
                {
                    // Lấy thông tin nhóm thực hành cụ thể
                    var practiceGroup = await context.PracticeGroups
                        .Include(pg => pg.Lecturer)
                            .ThenInclude(l => l.User)
                        .Include(pg => pg.Schedules)
                            .ThenInclude(s => s.ScheduleType)
                        .FirstOrDefaultAsync(pg => pg.PracticeGroupId == practiceGroupId.Value &&
                                                  pg.SectionId == sectionId);

                    if (practiceGroup == null)
                        return null;

                    // Lấy sinh viên trong nhóm thực hành này
                    students = await GetPracticeGroupStudentsAsync(practiceGroupId.Value);

                    // Lấy lịch thực hành của nhóm này
                    schedules = practiceGroup.Schedules
                        .Select(s => new ScheduleInfoSectionDetail
                        {
                            ScheduleId = s.ScheduleId,
                            ScheduleTypeName = s.ScheduleType.Name,
                            DayOfWeek = s.DayOfWeek,
                            DayOfWeekText = s.DayOfWeek.HasValue ? GetDayOfWeekInVietnamese(s.DayOfWeek.Value) : "",
                            Date = s.Date,
                            StartTime = s.StartTime,
                            EndTime = s.EndTime,
                            TimeSlot = $"{s.StartTime:HH:mm} - {s.EndTime:HH:mm}",
                            Room = s.Room ?? "",
                            OnlineLink = s.OnlineLink,
                            IsExam = s.ScheduleType.ScheduleTypeId == 3
                        })
                        .OrderBy(s => s.DayOfWeek)
                        .ThenBy(s => s.StartTime)
                        .ToList();

                    practiceGroupInfo = new PracticeGroupInfoWithSection
                    {
                        PracticeGroupId = practiceGroup.PracticeGroupId,
                        GroupName = practiceGroup.GroupName,
                        Description = practiceGroup.Description,
                        MaxCapacity = practiceGroup.MaxCapacity,
                        CurrentCount = practiceGroup.CurrentCount,
                        PracticeLecturerName = practiceGroup.Lecturer?.User?.FullName
                    };
                }
                else
                {
                    // Lấy tất cả sinh viên có trong các nhóm thực hành của section
                    students = await GetAllPracticeStudentsInSectionAsync(sectionId);

                    // Lấy tất cả lịch thực hành của section
                    var allPracticeSchedules = await context.Schedules
                        .Include(s => s.ScheduleType)
                        .Include(s => s.PracticeGroup)
                        .Where(s => s.Section.SectionId == sectionId && s.PracticeGroupId.HasValue)
                        .ToListAsync();

                    schedules = allPracticeSchedules
                        .Select(s => new ScheduleInfoSectionDetail
                        {
                            ScheduleId = s.ScheduleId,
                            ScheduleTypeName = s.ScheduleType.Name,
                            DayOfWeek = s.DayOfWeek,
                            DayOfWeekText = s.DayOfWeek.HasValue ? GetDayOfWeekInVietnamese(s.DayOfWeek.Value) : "",
                            Date = s.Date,
                            StartTime = s.StartTime,
                            EndTime = s.EndTime,
                            TimeSlot = $"{s.StartTime:HH:mm} - {s.EndTime:HH:mm}",
                            Room = s.Room ?? "",
                            OnlineLink = s.OnlineLink,
                            IsExam = s.ScheduleType.ScheduleTypeId == 3
                        })
                        .OrderBy(s => s.DayOfWeek)
                        .ThenBy(s => s.StartTime)
                        .ToList();
                }
            }
            else
            {
                // Lấy thông tin lý thuyết
                students = await GetTheoryStudentsAsync(sectionId);

                // Lấy lịch lý thuyết (không phải thực hành)
                var theorySchedules = section.Schedules
                    .Where(s => !s.PracticeGroupId.HasValue && s.ScheduleType.ScheduleTypeId != 3)
                    .ToList();

                schedules = theorySchedules
                    .Select(s => new ScheduleInfoSectionDetail
                    {
                        ScheduleId = s.ScheduleId,
                        ScheduleTypeName = s.ScheduleType.Name,
                        DayOfWeek = s.DayOfWeek,
                        DayOfWeekText = s.DayOfWeek.HasValue ? GetDayOfWeekInVietnamese(s.DayOfWeek.Value) : "",
                        StartTime = s.StartTime,
                        EndTime = s.EndTime,
                        TimeSlot = $"{s.StartTime:HH:mm} - {s.EndTime:HH:mm}",
                        Room = s.Room ?? "",
                        OnlineLink = s.OnlineLink,
                        Date = s.Date,
                        IsExam = s.ScheduleType.ScheduleTypeId == 3
                    })
                    .OrderBy(s => s.DayOfWeek)
                    .ThenBy(s => s.StartTime)
                    .ToList();
            }

            // Tính toán thống kê
            var maleCount = students.Count(s => s.Gender.Equals("Male", StringComparison.OrdinalIgnoreCase));
            var femaleCount = students.Count(s => s.Gender.Equals("Female", StringComparison.OrdinalIgnoreCase));

            return new SectionDetailWithScheduleResponse
            {
                SectionId = section.SectionId,
                SectionCode = section.SectionCode ?? $"LHP{section.SectionId}",
                CourseName = section.CurriculumCourse.Course.CourseName,
                CourseCode = section.CurriculumCourse.Course.CourseCode,
                Credits = section.CurriculumCourse.Course.CreditsTheory + section.CurriculumCourse.Course.CreditsLab,

                ClassName = section.Class.ClassName,
                ClassCode = section.Class.ClassCode,

                SemesterName = $"{section.Semester.Year} - {section.Semester.Term}",

                LecturerName = section.Lecturer?.User?.FullName ?? "Not Assigned",

                StartDate = section.StartDate,
                EndDate = section.EndDate,
                Capacity = section.Capacity,
                EnrolledCount = section.EnrolledCount,

                Schedules = schedules,
                PracticeGroup = practiceGroupInfo,
                Students = students,

                TotalStudents = students.Count,
                MaleStudents = maleCount,
                FemaleStudents = femaleCount
            };
        }

        // Helper methods
        private async Task<List<BasicStudentInfo>> GetTheoryStudentsAsync(int sectionId)
        {
            return await context.Enrollments
                .Include(e => e.Student)
                    .ThenInclude(s => s.User)
                .Where(e => e.Section.SectionId == sectionId &&
                           e.enrollmentStatus == Enum.EnrollmentStatus.Enrolled)
                .Select(e => new BasicStudentInfo
                {
                    StudentId = e.Student.Id,
                    MSSV = e.Student.MSSV,
                    FullName = e.Student.User.FullName,
                    Gender = e.Student.User.Gender.ToString() ?? "",
                    DateOfBirth = e.Student.User.DateOfBirth,
                    PracticeGroupName = null // Không có trong lý thuyết
                })
                .OrderBy(s => s.MSSV)
                .ToListAsync();
        }

        private async Task<List<BasicStudentInfo>> GetPracticeGroupStudentsAsync(int practiceGroupId)
        {
            return await context.PracticeGroupEnrollments
                .Include(pge => pge.Student)
                    .ThenInclude(s => s.User)
                .Include(pge => pge.PracticeGroup)
                .Where(pge => pge.PracticeGroupId == practiceGroupId && pge.IsActive)
                .Select(pge => new BasicStudentInfo
                {
                    StudentId = pge.Student.Id,
                    MSSV = pge.Student.MSSV,
                    FullName = pge.Student.User.FullName,
                    Gender = pge.Student.User.Gender.ToString() ?? "",
                    DateOfBirth = pge.Student.User.DateOfBirth,
                    PracticeGroupName = pge.PracticeGroup.GroupName
                })
                .OrderBy(s => s.MSSV)
                .ToListAsync();
        }

        private async Task<List<BasicStudentInfo>> GetAllPracticeStudentsInSectionAsync(int sectionId)
        {
            return await context.PracticeGroupEnrollments
                .Include(pge => pge.Student)
                    .ThenInclude(s => s.User)
                .Include(pge => pge.PracticeGroup)
                .Where(pge => pge.PracticeGroup.SectionId == sectionId && pge.IsActive)
                .Select(pge => new BasicStudentInfo
                {
                    StudentId = pge.Student.Id,
                    MSSV = pge.Student.MSSV,
                    FullName = pge.Student.User.FullName,
                    Gender = pge.Student.User.Gender.ToString() ?? "",
                    DateOfBirth = pge.Student.User.DateOfBirth,
                    PracticeGroupName = pge.PracticeGroup.GroupName
                })
                .OrderBy(s => s.MSSV)
                .ToListAsync();
        }

        public async Task<Section?> UpdateSectionAsync(int sectionId, UpdateSectionRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Get the existing section with all related data
                var section = await context.Sections
                    .Include(s => s.CurriculumCourse)
                        .ThenInclude(cc => cc.Course)
                    .Include(s => s.Lecturer)
                    .Include(s => s.Semester)
                    .Include(s => s.Class)
                    .FirstOrDefaultAsync(s => s.SectionId == sectionId);

                if (section == null)
                {
                    return null;
                }

                // Check if section can be updated (business rules)
                var canUpdate = await CanUpdateSectionAsync(section);
                if (!canUpdate.CanUpdate)
                {
                    throw new Exception(canUpdate.Reason);
                }

                // Update CurriculumCourse if changed
                if (request.CurriculumCourseId.HasValue && 
                    section.CurriculumCourse.Id != request.CurriculumCourseId.Value)
                {
                    var newCurriculumCourse = await context.CurriculumCourses
                        .Include(cc => cc.Course)
                        .FirstOrDefaultAsync(cc => cc.Id == request.CurriculumCourseId.Value);
                    
                    if (newCurriculumCourse == null)
                    {
                        throw new Exception("CurriculumCourse not found");
                    }
                    
                    section.CurriculumCourse = newCurriculumCourse;
                }

                // Update Lecturer if changed
                if (request.LecturerId.HasValue && 
                    section.Lecturer?.Id != request.LecturerId.Value)
                {
                    var newLecturer = await context.Lecturers.FindAsync(request.LecturerId.Value);
                    if (newLecturer == null)
                    {
                        throw new Exception("Lecturer not found");
                    }
                    section.Lecturer = newLecturer;
                }

                // Update Semester if changed
                if (request.SemesterId.HasValue && 
                    section.Semester.SemesterId != request.SemesterId.Value)
                {
                    var newSemester = await context.Semesters.FindAsync(request.SemesterId.Value);
                    if (newSemester == null)
                    {
                        throw new Exception("Semester not found");
                    }
                    section.Semester = newSemester;
                }

                // Update Class if changed
                if (request.ClassId.HasValue && 
                    section.Class.ClassId != request.ClassId.Value)
                {
                    var newClass = await context.Classes.FindAsync(request.ClassId.Value);
                    if (newClass == null)
                    {
                        throw new Exception("Class not found");
                    }
                    section.Class = newClass;
                }

                // Update basic properties
                if (request.StartDate.HasValue)
                {
                    section.StartDate = request.StartDate.Value;
                }

                if (request.EndDate.HasValue)
                {
                    section.EndDate = request.EndDate.Value;
                }

                if (request.Capacity.HasValue)
                {
                    // Validate capacity is not less than current enrollment
                    if (request.Capacity.Value < section.EnrolledCount)
                    {
                        throw new Exception($"Capacity cannot be less than current enrollment ({section.EnrolledCount})");
                    }
                    section.Capacity = request.Capacity.Value;
                }

                if (request.Status.HasValue)
                {
                    // Validate status change
                    var canChangeStatus = await CanChangeStatusAsync(section, request.Status.Value);
                    if (!canChangeStatus.CanChange)
                    {
                        throw new Exception(canChangeStatus.Reason);
                    }
                    section.Status = request.Status.Value;
                }

                // Update minimum enrollment settings if provided
                if (request.MinEnrollment.HasValue)
                {
                    section.MinEnrollment = request.MinEnrollment.Value;
                }

                if (request.MinEnrollmentPercentage.HasValue)
                {
                    if (request.MinEnrollmentPercentage.Value < 0 || request.MinEnrollmentPercentage.Value > 1)
                    {
                        throw new Exception("MinEnrollmentPercentage must be between 0 and 1");
                    }
                    section.MinEnrollmentPercentage = request.MinEnrollmentPercentage.Value;
                }

                // Regenerate section code if curriculum course, semester, or class changed
                if (request.CurriculumCourseId.HasValue || request.SemesterId.HasValue || request.ClassId.HasValue)
                {
                    // Get updated references
                    var curriculumCourse = section.CurriculumCourse;
                    var semester = section.Semester;
                    var classSection = section.Class;

                    string newSectionCode = $"LHP{curriculumCourse.Course.CourseCode}-{semester.Year}{semester.Term}-{classSection.ClassCode}";
                    section.SectionCode = newSectionCode;
                }

                // Update the section
                context.Sections.Update(section);
                await context.SaveChangesAsync();

                await transaction.CommitAsync();
                return section;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<(bool CanUpdate, string Reason)> CanUpdateSectionAsync(Section section)
        {
            // Check if section is cancelled
            if (section.IsCancelled)
            {
                return (false, "Cannot update a cancelled section");
            }

            // Check if section has already ended
            var today = DateOnly.FromDateTime(DateTime.Now);
            if (today > section.EndDate)
            {
                return (false, "Cannot update a section that has already ended");
            }

            // Check if section has started and has enrollments
            if (today >= section.StartDate && section.EnrolledCount > 0)
            {
                // Allow limited updates for active sections with enrollments
                // (e.g., only capacity increase, status changes)
                return (true, "Limited updates allowed for active section");
            }

            return (true, "Section can be updated");
        }

        private async Task<(bool CanChange, string Reason)> CanChangeStatusAsync(Section section, SectionStatus newStatus)
        {
            var currentStatus = section.Status;

            // Define allowed status transitions
            var allowedTransitions = new Dictionary<SectionStatus, SectionStatus[]>
            {
                [SectionStatus.IsPreparing] = new[] { SectionStatus.IsOpening, SectionStatus.IsClosed },
                [SectionStatus.IsOpening] = new[] { SectionStatus.IsPreparing, SectionStatus.IsClosed },
                [SectionStatus.IsClosed] = new[] { SectionStatus.IsOpening } // Can reopen if needed
            };

            if (!allowedTransitions.ContainsKey(currentStatus))
            {
                return (false, $"No transitions allowed from status {currentStatus}");
            }

            if (!allowedTransitions[currentStatus].Contains(newStatus))
            {
                return (false, $"Cannot change status from {currentStatus} to {newStatus}");
            }

            // Additional business logic checks
            if (newStatus == SectionStatus.IsOpening)
            {
                // Check if section has schedules
                var hasMainSchedules = await context.Schedules
                    .AnyAsync(s => s.Section.SectionId == section.SectionId && 
                                  !s.PracticeGroupId.HasValue && 
                                  s.ScheduleType.ScheduleTypeId != 3);

                if (!hasMainSchedules)
                {
                    return (false, "Cannot open section without main schedules");
                }

                // Check if registration period is active
                var registrationPeriod = await context.RegistrationPeriods
                    .Include(rp => rp.Semester)
                    .Include(rp => rp.Department)
                    .FirstOrDefaultAsync(rp => 
                        rp.Semester.SemesterId == section.Semester.SemesterId &&
                        rp.Department.DepartmentId == section.CurriculumCourse.Program.Department.DepartmentId);

                if (registrationPeriod == null || !registrationPeriod.IsActive)
                {
                    return (false, "Cannot open section when registration period is not active");
                }
            }

            return (true, "Status change is allowed");
        }

        public async Task<IEnumerable<CurriculumCourseDropdownResponse>> GetCurriculumCoursesDropdownAsync()
        {
            return await context.CurriculumCourses
                .Include(cc => cc.Course)
                .Include(cc => cc.Program)
                .Select(cc => new CurriculumCourseDropdownResponse
                {
                    Id = cc.Id,
                    Name = $"{cc.Course.CourseCode} - {cc.Course.CourseName}",
                    CourseCode = cc.Course.CourseCode,
                    Credits = cc.Course.CreditsTheory + cc.Course.CreditsLab,
                    ProgramName = cc.Program.ProgramName
                })
                .OrderBy(cc => cc.CourseCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<LecturerDropdownResponse>> GetLecturersDropdownAsync()
        {
            return await context.Lecturers
                .Include(l => l.User)
                .Where(l => l.User.AccountStatus == AccountStatus.Active)
                .Select(l => new LecturerDropdownResponse
                {
                    Id = l.Id,
                    Name = l.User.FullName,
                    LecturerCode = l.User.Username,
                    Email = l.User.Email ?? ""
                })
                .OrderBy(l => l.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<SemesterDropdownResponse>> GetSemestersDropdownAsync()
        {
            return await context.Semesters
                .Select(s => new SemesterDropdownResponse
                {
                    Id = s.SemesterId,
                    Name = $"{s.Year} - {s.Term}",
                    Year = s.Year,
                    Term = s.Term,
                })
                .OrderByDescending(s => s.Year)
                .ThenByDescending(s => s.Term)
                .ToListAsync();
        }

        public async Task<IEnumerable<ClassDropdownResponse>> GetClassesDropdownAsync()
        {
            return await context.Classes
                .Include(c => c.Program)
                .Select(c => new ClassDropdownResponse
                {
                    ClassId = c.ClassId,
                    ClassName = c.ClassName,
                    ClassCode = c.ClassCode,
                    ProgramName = c.Program.ProgramName
                })
                .OrderBy(c => c.ClassCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<ClassDropdownResponse>> GetClassesByProgramDropdownAsync(int programId)
        {
            return await context.Classes
                .Include(c => c.Program)
                .Where(c => c.Program.AcademicProgramId == programId)
                .Select(c => new ClassDropdownResponse
                {
                    ClassId = c.ClassId,
                    ClassName = c.ClassName,
                    ClassCode = c.ClassCode,
                    ProgramName = c.Program.ProgramName
                })
                .OrderBy(c => c.ClassCode)
                .ToListAsync();
        }
    }
}