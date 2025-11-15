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
            var curriculumCourse = await context.CurriculumCourses
                .Include(e => e.Course)
                .FirstOrDefaultAsync(cc => cc.Id == request.CurriculumCourseId);
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

            string sectionCode = $"LHP{curriculumCourse.Course.CourseCode}-{existingSemester.Year}{existingSemester.Term}-{classSection.ClassCode}";


            Section newSection = new Section
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
    }
}