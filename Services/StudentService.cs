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
            User user = await context.Users.FindAsync(student.UserId) ?? throw new Exception("User not found");
            bool isExistMSSV = await IsExistMSSV(user.Username);
            if (isExistMSSV)
            {
                throw new Exception("MSSV already exists");
            }
            var newStudent = new Student
            {
                MSSV = user.Username,
                User = user,
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

        public async Task<IEnumerable<StudentDetailDto>> GetAllStudentsAsync()
        {
            return await context.Students.Select(
                
                s => new StudentDetailDto
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
                        AvatarUrl = s.User.AvatarUrl,
                        Role = s.User.Role
                    },
                    ClassName = s.Class.ClassName,
                }).ToListAsync();
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
                        AvatarUrl = s.User.AvatarUrl,
                        Role = s.User.Role
                    },
                    ClassName = s.Class.ClassName,
                    ProgramName = s.Class.Program.ProgramName,
                    DepartmentName = s.Class.Program.Department.DepartmentName
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<StudentDetailDto>> GetStudentsBySectionIdAsync(int sectionId)
        {
            var section = await context.Sections.FirstOrDefaultAsync(s => s.SectionId == sectionId);
            if (section is null)
            {
                throw new Exception("Section not found");
            }

            var students = await context.Enrollments
                .Where(e => e.Section.SectionId == sectionId)
                .Select(e => new StudentDetailDto
                {
                    StudentId = e.Student.Id,
                    MSSV = e.Student.MSSV,
                    User = new UserResponse
                    {
                        Username = e.Student.User.Username,
                        FullName = e.Student.User.FullName,
                        Email = e.Student.User.Email,
                        Phone = e.Student.User.Phone,
                        AccountStatus = e.Student.User.AccountStatus,
                        AvatarUrl = e.Student.User.AvatarUrl,
                        Role = e.Student.User.Role
                    },
                })
                .ToListAsync();

            return students;
        }

        public async Task<StudentDetailDto?> GetStudentByMSSV(string MSSV)
        {
            return await context.Students
                .Where(s => s.MSSV == MSSV)
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
                        AvatarUrl = s.User.AvatarUrl,
                        Role = s.User.Role,
                        PlaceOfBirth = s.User.PlaceOfBirth

                    },
                    ClassName = s.Class.ClassName,
                    ProgramName = s.Class.Program.ProgramName,
                    DepartmentName = s.Class.Program.Department.DepartmentName,
                    TrainningLevel = s.Class.Program.DegreeLevel,
                    YearOfAddmision = s.YearOfAdmission
                })
                .FirstOrDefaultAsync();


        }
    }
}
