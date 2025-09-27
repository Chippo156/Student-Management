using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class AcademicProgramService(AppDbContext context) : IAcademicProgramService
    {
        public async Task<AcademicProgram> CreateProgramAsync(AcademicProgramRequest request)
        {
            var department = await context.Departments.FindAsync(request.DepartmentId);
            if (department is null)
            {
                throw new Exception("Department not found");
            }

            var program = new AcademicProgram
            {
                ProgramName = request.ProgramName,
                DegreeLevel = request.DegreeLevel,
                Department = department
            };

            context.Programs.Add(program);
            await context.SaveChangesAsync();
            return program;
        }

        public async Task<bool> DeleteProgramAsync(int programId)
        {
            var program = await context.Programs.FindAsync(programId);
            if (program is null)
            {
                return false;
            }

            context.Programs.Remove(program);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<AcademicProgram>> GetAllProgramsAsync()
        {
            return await context.Programs
                .Include(p => p.Department)
                .ToListAsync();
        }

        public async Task<AcademicProgram?> GetProgramByIdAsync(int programId)
        {
            return await context.Programs
                .Include(p => p.Department)
                .FirstOrDefaultAsync(p => p.AcademicProgramId == programId);
        }

        public async Task<IEnumerable<AcademicProgram>> GetProgramsByDepartmentAsync(int departmentId)
        {
            return await context.Programs
                .Include(p => p.Department)
                .Where(p => p.Department.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<AcademicProgram?> UpdateProgramAsync(int programId, AcademicProgramRequest request)
        {
            var program = await context.Programs.FindAsync(programId);
            if (program is null)
            {
                return null;
            }

            var department = await context.Departments.FindAsync(request.DepartmentId);
            if (department is null)
            {
                throw new Exception("Department not found");
            }

            program.ProgramName = request.ProgramName;
            program.DegreeLevel = request.DegreeLevel;
            program.Department = department;

            context.Programs.Update(program);
            await context.SaveChangesAsync();
            return program;
        }
    }
}