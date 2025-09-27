using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class DepartmentService(AppDbContext context) : IDepartmentService
    {
        public Task<Department> CreateDepartmentAsync(DepartmentRequest departmentRequest)
        {
            Department department = new Department
            {
                DepartmentName = departmentRequest.DepartmentName
            };
            var faculty = context.Falcuties.Find(departmentRequest.FacultyId);
            if (faculty is null)
            {
                throw new Exception("Faculty not found");
            }
            department.Faculty = faculty;

            context.Departments.Add(department);
            context.SaveChanges();
            return Task.FromResult(department);
        }

        public Task<bool> DeleteDepartmentAsync(int departmentId)
        {
           Department department
                = context.Departments.Find(departmentId) ?? throw new Exception("Department not found");
            context.Departments.Remove(department);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public Task<IEnumerable<Department>> GetAllDepartmentsAsync()
        {
            return Task.FromResult(context.Departments.AsEnumerable());
        }

        public Task<Department?> GetDepartmentByIdAsync(int departmentId)
        {
            Department? department
                = context.Departments.Find(departmentId);
            return Task.FromResult(department);
        }

        public Task<Department?> UpdateDepartmentAsync(int departmentId, string newDepartmentName)
        {
            Department? department
                = context.Departments.Find(departmentId);
            if (department is null)
                {
                return Task.FromResult<Department?>(null);
            }
            department.DepartmentName = newDepartmentName;
            context.Departments.Update(department);
            context.SaveChanges();
            return Task.FromResult<Department?>(department);
        }
    }
}
