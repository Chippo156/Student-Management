using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
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
                ?? throw new Exception("Program not found");

            var newClass = new Class
            {
                ClassName = classRequest.ClassName.Trim(),
                ClassCode = GenerateClassCode(classRequest.ClassName),
                Program = program
            };

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

        public async Task<Class?> UpdateClassAsync(int classId, string className)
        {
            var classEntity = await context.Classes.FindAsync(classId);
            if (classEntity == null)
                return null;

            classEntity.ClassName = className.Trim();
            classEntity.ClassCode = GenerateClassCode(className);

            context.Classes.Update(classEntity);
            await context.SaveChangesAsync();
            return classEntity;
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