using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class ClassService(AppDbContext context) : IClassService
    {
        public async Task<Class> CreateClassAsync(ClassRequest classRequest)
        {
            var program = await context.Programs.FindAsync(classRequest.ProgramId)
                ?? throw new Exception("Không tìm thấy chương trình");
            
            var newClass = new Class
            {
                ClassName = classRequest.ClassName.Trim(),
                ClassCode = GenerateClassCode(classRequest.ClassName),
                Program = program,
            };

            var classNameExists = await context.Classes
                .AnyAsync(c => c.ClassName.ToLower() == newClass.ClassName.ToLower());
            if (classNameExists)
                throw new Exception($"Lớp với tên '{newClass.ClassName}' đã tồn tại");


            if (classRequest.LecturerId != null)
            {
                var lecturer = await context.Lecturers.FindAsync(classRequest.LecturerId);
                if (lecturer == null)
                    throw new Exception("Không tìm thấy giảng viên");
                AdviserAssignment adviserAssignment = new AdviserAssignment
                {
                    Lecturer = lecturer,
                    StartDate = DateOnly.FromDateTime(DateTime.Now),
                    EndDate = null
                };
                context.AdviserAssignments.Add(adviserAssignment);
                await context.SaveChangesAsync();
                newClass.AdviserAssignment = adviserAssignment;
            }
            context.Classes.Add(newClass);
            await context.SaveChangesAsync();
            return newClass;
        }

        public async Task<bool> DeleteClassAsync(int classId)
        {
            var classEntity = await context.Classes.FindAsync(classId);
            if (classEntity == null)
                return false;

            context.Classes.Remove(classEntity);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Class>> GetAllClassesAsync()
        {
            return await context.Classes
                .Include(c => c.Program)
                    .ThenInclude(p => p.Department)
                .Include(c => c.AdviserAssignment)
                    .ThenInclude(aa => aa.Lecturer)
                        .ThenInclude(l => l.User)
                .OrderBy(c => c.Program.Department.DepartmentName)
                .ThenBy(c => c.Program.ProgramName)
                .ThenBy(c => c.ClassName)
                .ToListAsync();
        }

        public async Task<Class?> GetClassByIdAsync(int classId)
        {
            return await context.Classes
                .Include(c => c.Program)
                    .ThenInclude(p => p.Department)
                .Include(c => c.AdviserAssignment)
                    .ThenInclude(aa => aa.Lecturer)
                        .ThenInclude(l => l.User)
                .FirstOrDefaultAsync(c => c.ClassId == classId);
        }

        public async Task<Class?> UpdateClassAsync(int classId, UpdateClassRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            
            try
            {
                // Get existing class with all related data
                var classEntity = await context.Classes
                    .Include(c => c.Program)
                        .ThenInclude(p => p.Department)
                    .Include(c => c.AdviserAssignment)
                        .ThenInclude(aa => aa.Lecturer)
                            .ThenInclude(l => l.User)
                    .FirstOrDefaultAsync(c => c.ClassId == classId);

                if (classEntity == null)
                {
                    return null;
                }

                // Validate business rules
                var validationResult = await ValidateClassUpdateAsync(classEntity, request);
                if (!validationResult.IsValid)
                {
                    throw new Exception(string.Join(", ", validationResult.Errors));
                }

                // Update class name and code if changed
                if (!string.Equals(classEntity.ClassName.Trim(), request.ClassName.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    classEntity.ClassName = request.ClassName.Trim();
                    classEntity.ClassCode = GenerateClassCode(request.ClassName);
                }

                // Update program if changed
                if (request.ProgramId.HasValue && classEntity.Program.AcademicProgramId != request.ProgramId.Value)
                {
                    var newProgram = await context.Programs.FindAsync(request.ProgramId.Value);
                    if (newProgram == null)
                    {
                        throw new Exception("Không tìm thấy chương trình");
                    }
                    classEntity.Program = newProgram;
                }

                // Handle adviser assignment update
                if (request.LecturerId.HasValue)
                {
                    var newLecturer = await context.Lecturers
                        .Include(l => l.User)
                        .FirstOrDefaultAsync(l => l.Id == request.LecturerId.Value);
                    
                    if (newLecturer == null)
                    {
                        throw new Exception("Không tìm thấy giảng viên");
                    }

                    // Check if lecturer is active
                    if (newLecturer.User.AccountStatus != AccountStatus.Active)
                    {
                        throw new Exception("Không thể chỉ định giảng viên không hoạt động làm cố vấn lớp");
                    }

                    // Update existing adviser assignment or create new one
                    if (classEntity.AdviserAssignment != null)
                    {
                        // If changing to a different lecturer
                        if (classEntity.AdviserAssignment.Lecturer.Id != request.LecturerId.Value)
                        {
                            // End current assignment
                            classEntity.AdviserAssignment.EndDate = DateOnly.FromDateTime(DateTime.Now);
                            context.AdviserAssignments.Update(classEntity.AdviserAssignment);

                            // Create new assignment
                            var newAdviserAssignment = new AdviserAssignment
                            {
                                Lecturer = newLecturer,
                                StartDate = DateOnly.FromDateTime(DateTime.Now),
                                EndDate = null
                            };

                            context.AdviserAssignments.Add(newAdviserAssignment);
                            await context.SaveChangesAsync();
                            classEntity.AdviserAssignment = newAdviserAssignment;
                        }
                        // If same lecturer, no change needed
                    }
                    else
                    {
                        // No existing adviser, create new assignment
                        var adviserAssignment = new AdviserAssignment
                        {
                            Lecturer = newLecturer,
                            StartDate = DateOnly.FromDateTime(DateTime.Now),
                            EndDate = null
                        };

                        context.AdviserAssignments.Add(adviserAssignment);
                        await context.SaveChangesAsync();
                        classEntity.AdviserAssignment = adviserAssignment;
                    }
                }
                //else
                //{
                //    // Remove adviser assignment if LecturerId is null or 0
                //    if (classEntity.AdviserAssignment != null)
                //    {
                //        classEntity.AdviserAssignment.EndDate = DateOnly.FromDateTime(DateTime.Now);
                //        context.AdviserAssignments.Update(classEntity.AdviserAssignment);
                //        classEntity.AdviserAssignment = null;
                //    }
                //}
                classEntity.UpdatedAt = DateTime.Now;

                context.Classes.Update(classEntity);
                await context.SaveChangesAsync();

                await transaction.CommitAsync();
                return classEntity;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Failed to update class: {ex.Message}");
            }
        }

        private async Task<(bool IsValid, List<string> Errors)> ValidateClassUpdateAsync(Class classEntity, UpdateClassRequest request)
        {
            var errors = new List<string>();

            // Check if class name already exists (excluding current class)
            if (!string.IsNullOrWhiteSpace(request.ClassName))
            {
                var duplicateClassName = await context.Classes
                    .AnyAsync(c => c.ClassName.ToLower() == request.ClassName.Trim().ToLower() && 
                                  c.ClassId != classEntity.ClassId);
                
                if (duplicateClassName)
                {
                    errors.Add($"Class name '{request.ClassName}' already exists");
                }
            }

            // Validate program change constraints
            if (request.ProgramId.HasValue && classEntity.Program.AcademicProgramId != request.ProgramId.Value)
            {
                // Check if class has students enrolled
                var hasStudents = await context.Students
                    .AnyAsync(s => s.Class.ClassId == classEntity.ClassId);

                if (hasStudents)
                {
                    // Get student count for better error message
                    var studentCount = await context.Students
                        .CountAsync(s => s.Class.ClassId == classEntity.ClassId);
                    
                    errors.Add($"Cannot change program for class with {studentCount} enrolled students. Please transfer students first.");
                }

                // Validate new program exists
                var programExists = await context.Programs
                    .AnyAsync(p => p.AcademicProgramId == request.ProgramId.Value);
                
                if (!programExists)
                {
                    errors.Add("Specified program does not exist");
                }
            }

            // Validate lecturer assignment
            if (request.LecturerId.HasValue && request.LecturerId.Value > 0)
            {
                var lecturer = await context.Lecturers
                    .Include(l => l.User)
                    .FirstOrDefaultAsync(l => l.Id == request.LecturerId.Value);

                if (lecturer == null)
                {
                    errors.Add("Specified lecturer does not exist");
                }
                else if (lecturer.User.AccountStatus != AccountStatus.Active)
                {
                    errors.Add("Cannot assign inactive lecturer as class adviser");
                }
                else
                {
                    // Check if lecturer is already advising other classes (business rule - optional)
                    var currentAdviserCount = await context.AdviserAssignments
                        .CountAsync(aa => aa.Lecturer.Id == request.LecturerId.Value && 
                                         aa.EndDate == null);

                    const int MAX_CLASSES_PER_ADVISER = 1; // Configurable limit
                    if (currentAdviserCount >= MAX_CLASSES_PER_ADVISER)
                    {
                        errors.Add($"Lecturer is already advising {currentAdviserCount} classes (maximum {MAX_CLASSES_PER_ADVISER} allowed)");
                    }
                }
            }

            return (errors.Count == 0, errors);
        }

        // Dropdown methods
        public async Task<IEnumerable<ClassDropdownResponse>> GetClassesDropdownAsync()
        {
            return await context.Classes
                .Include(c => c.Program)
                    .ThenInclude(p => p.Department)
                .OrderBy(c => c.Program.Department.DepartmentName)
                .ThenBy(c => c.Program.ProgramName)
                .ThenBy(c => c.ClassName)
                .Select(c => new ClassDropdownResponse
                {
                    ClassId = c.ClassId,
                    ClassName = c.ClassName,
                    ClassCode = c.ClassCode,
                    ProgramId = c.Program.AcademicProgramId,
                    ProgramName = c.Program.ProgramName,
                    DegreeLevel = c.Program.DegreeLevel,
                    DepartmentId = c.Program.Department.DepartmentId,
                    DepartmentName = c.Program.Department.DepartmentName
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<ClassDropdownResponse>> GetClassesByProgramDropdownAsync(int programId)
        {
            return await context.Classes
                .Include(c => c.Program)
                    .ThenInclude(p => p.Department)
                .Where(c => c.Program.AcademicProgramId == programId)
                .OrderBy(c => c.ClassName)
                .Select(c => new ClassDropdownResponse
                {
                    ClassId = c.ClassId,
                    ClassName = c.ClassName,
                    ClassCode = c.ClassCode,
                    ProgramId = c.Program.AcademicProgramId,
                    ProgramName = c.Program.ProgramName,
                    DegreeLevel = c.Program.DegreeLevel,
                    DepartmentId = c.Program.Department.DepartmentId,
                    DepartmentName = c.Program.Department.DepartmentName
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<ClassDropdownResponse>> GetClassesByDepartmentDropdownAsync(int departmentId)
        {
            return await context.Classes
                .Include(c => c.Program)
                    .ThenInclude(p => p.Department)
                .Where(c => c.Program.Department.DepartmentId == departmentId)
                .OrderBy(c => c.Program.ProgramName)
                .ThenBy(c => c.ClassName)
                .Select(c => new ClassDropdownResponse
                {
                    ClassId = c.ClassId,
                    ClassName = c.ClassName,
                    ClassCode = c.ClassCode,
                    ProgramId = c.Program.AcademicProgramId,
                    ProgramName = c.Program.ProgramName,
                    DegreeLevel = c.Program.DegreeLevel,
                    DepartmentId = c.Program.Department.DepartmentId,
                    DepartmentName = c.Program.Department.DepartmentName
                })
                .ToListAsync();
        }

        public async Task<PagedResult<ClassResponse>> GetClassesWithPaginationAsync(
            PaginationParams pagination,
            string? search = null,
            int? programId = null)
        {
            var query = context.Classes
                .Include(c => c.Program)
                    .ThenInclude(p => p.Department)
                        .ThenInclude(d => d.Faculty)
                .Include(c => c.AdviserAssignment)
                    .ThenInclude(aa => aa.Lecturer)
                        .ThenInclude(l => l.User)
                .AsQueryable();

            // Apply search filter - tìm kiếm trong tên lớp và mã lớp
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(c => 
                    c.ClassName.ToLower().Contains(searchTerm) ||
                    c.ClassCode.ToLower().Contains(searchTerm));
            }

            // Apply program filter
            if (programId.HasValue)
            {
                query = query.Where(c => c.Program.AcademicProgramId == programId.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting and pagination
            var classes = await query
                .OrderByDescending(c => c.CreatedAt)
                .ThenBy(c => c.ClassName)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            // Map to response DTOs
            var classResponses = new List<ClassResponse>();

            foreach (var cls in classes)
            {
                // Get student count for this class
                var studentCount = await context.Students
                    .CountAsync(s => s.Class.ClassId == cls.ClassId);

                var classResponse = new ClassResponse
                {
                    ClassId = cls.ClassId,
                    ClassName = cls.ClassName,
                    ClassCode = cls.ClassCode,
                    
                    // Program information
                    ProgramId = cls.Program.AcademicProgramId,
                    ProgramName = cls.Program.ProgramName,
                    DegreeLevel = cls.Program.DegreeLevel,
                    
                    // Department information
                    DepartmentId = cls.Program.Department.DepartmentId,
                    DepartmentName = cls.Program.Department.DepartmentName,
                    FacultyName = cls.Program.Department.Faculty.FacultyName,
                    
                    // Adviser information
                    AdviserId = cls.AdviserAssignment?.Lecturer?.Id,
                    AdviserName = cls.AdviserAssignment?.Lecturer?.User?.FullName ?? "Chưa phân công",
                    AdviserCode = cls.AdviserAssignment?.Lecturer?.LecturerCode ?? "",
                    
                    // Statistics
                    StudentCount = studentCount,
                    
                    // Additional info
                    RequiredCredits = cls.Program.CreditsRequired
                };

                classResponses.Add(classResponse);
            }

            return new PagedResult<ClassResponse>
            {
                Items = classResponses,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        // Helper method to generate class code
        private static string GenerateClassCode(string className)
        {
            // Simple logic to generate class code from class name
            // You can customize this based on your requirements
            var words = className.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var code = string.Join("", words.Select(w => w.Length > 0 ? w[0].ToString().ToUpper() : ""));

            // Add some randomness or timestamp if needed
            var timestamp = DateTime.Now.ToString("yyMM");
            return $"{code}{timestamp}";
        }
    }
}