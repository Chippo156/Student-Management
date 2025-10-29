using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class DepartmentService(AppDbContext context) : IDepartmentService
    {
        public async Task<Department> CreateDepartmentAsync(DepartmentRequest request)
        {
            var faculty = await context.Falcuties.FindAsync(request.FacultyId)
                ?? throw new Exception("Faculty not found");

            var department = new Department
            {
                DepartmentName = request.DepartmentName.Trim(),
                Faculty = faculty
            };

            context.Departments.Add(department);
            await context.SaveChangesAsync();
            return department;
        }

        public async Task<bool> DeleteDepartmentAsync(int departmentId)
        {
            var department = await context.Departments.FindAsync(departmentId);
            if (department == null)
                return false;

            context.Departments.Remove(department);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Department>> GetAllDepartmentsAsync()
        {
            return await context.Departments
                .Include(d => d.Faculty)
                .OrderBy(d => d.Faculty.FacultyName)
                .ThenBy(d => d.DepartmentName)
                .ToListAsync();
        }

        public async Task<Department?> GetDepartmentByIdAsync(int departmentId)
        {
            return await context.Departments
                .Include(d => d.Faculty)
                .FirstOrDefaultAsync(d => d.DepartmentId == departmentId);
        }

        public async Task<Department?> UpdateDepartmentAsync(int departmentId, DepartmentRequest request)
        {
            var department = await context.Departments.FindAsync(departmentId);
            if (department == null)
                return null;

            var faculty = await context.Falcuties.FindAsync(request.FacultyId)
                ?? throw new Exception("Faculty not found");

            department.DepartmentName = request.DepartmentName.Trim();
            department.Faculty = faculty;

            context.Departments.Update(department);
            await context.SaveChangesAsync();
            return department;
        }

        // Dropdown methods
        public async Task<IEnumerable<DepartmentDropdownResponse>> GetDepartmentsDropdownAsync()
        {
            return await context.Departments
                .Include(d => d.Faculty)
                .OrderBy(d => d.Faculty.FacultyName)
                .ThenBy(d => d.DepartmentName)
                .Select(d => new DepartmentDropdownResponse
                {
                    DepartmentId = d.DepartmentId,
                    DepartmentName = d.DepartmentName,
                    FacultyId = d.Faculty.FacultyId,
                    FacultyName = d.Faculty.FacultyName
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<DepartmentDropdownResponse>> GetDepartmentsByFacultyDropdownAsync(int facultyId)
        {
            return await context.Departments
                .Include(d => d.Faculty)
                .Where(d => d.Faculty.FacultyId == facultyId)
                .OrderBy(d => d.DepartmentName)
                .Select(d => new DepartmentDropdownResponse
                {
                    DepartmentId = d.DepartmentId,
                    DepartmentName = d.DepartmentName,
                    FacultyId = d.Faculty.FacultyId,
                    FacultyName = d.Faculty.FacultyName
                })
                .ToListAsync();
        }
    }
}