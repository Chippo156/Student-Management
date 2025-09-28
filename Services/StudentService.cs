using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System;

namespace StudentManagement.Services
{
    public class StudentService(AppDbContext context) : IStudentService
    {
        public async Task<Student> CreateStudentAsync(StudentRequest student)
        {
            bool isExistMSSV = await IsExistMSSV(student.MSSV);
            if (isExistMSSV)
            {
                throw new Exception("MSSV already exists");
            }
            var newStudent = new Student
            {
                MSSV = student.MSSV,
                User = await context.Users.FindAsync(student.UserId) ?? throw new Exception("User not found"),
                Class = await context.Classes.FindAsync(student.ClassId) ?? throw new Exception("Class not found")
            };
            context.Students.Add(newStudent);
            await context.SaveChangesAsync();
            return newStudent;
        }
        private async Task<bool> IsExistMSSV(string MSSV)
        {
            return await context.Students.AnyAsync(s => s.MSSV == MSSV);
        }

        public Task<bool> DeleteStudentAsync(int studentId)
        {
            Student student = context.Students.Find(studentId) ?? throw new Exception("Student not found");
            context.Students.Remove(student);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public async Task<IEnumerable<Student>> GetAllStudentsAsync()
        {
            return await context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                .ToListAsync();
        }

     
            public async Task<StudentDetailDto?> GetStudentByIdAsync(int studentId)
        {
            return await context.Students
                .Where(s => s.Id == studentId)
                .Select(s => new StudentDetailDto
                {
                    StudentId = s.Id,
                    MSSV = s.MSSV,
                    User = new UserResponse
                    {
                        Username = s.User.Username,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        Phone = s.User.Phone,
                        Address = s.User.Address,
                        AccountStatus = s.User.AccountStatus,
                        AvatarUrl = s.User.AvatarUrl
                    },
                    ClassName = s.Class.ClassName,
                    ProgramName = s.Class.Program.ProgramName,
                    DepartmentName = s.Class.Program.Department.DepartmentName
                })
                .FirstOrDefaultAsync();
        }

    }
}
