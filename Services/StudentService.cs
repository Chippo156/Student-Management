using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System;
using System.Runtime.ConstrainedExecution;

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

        public async Task<PagedResult<Student>> GetAllStudentsAsync(PaginationParams pagination)
        {

            var query = context.Students
                .Include(s => s.User)
                .Include(s => s.Class)
                    .ThenInclude(c => c.Program)
                        .ThenInclude(p => p.Department)
                .AsQueryable();

            // Tổng số bản ghi
            var totalCount = await query.CountAsync();

            // Lấy trang hiện tại
            var students = await query
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();


            // Gói kết quả vào PagedResult
            return new PagedResult<Student>
            {
                Items = students,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
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
            var bankAccount = await context.BankAccounts
                .Where(b => b.IsDefault == true)
                .ToListAsync();

            return await context.Students
                .Where(s => s.MSSV == MSSV)
                .Include(s => s.User)
                .AsNoTracking()
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
                        PlaceOfBirth = s.User.PlaceOfBirth,
                        DateOfBirth = s.User.DateOfBirth,
                        CitizenIdCard = s.User.CitizenIdCard,
                        IssuedDate = s.User.IssuedDate,
                        Object = s.User.Object,
                        PolicyArea = s.User.PolicyArea,
                        DateOfJoinUnion = s.User.DateOfJoinUnion,
                        DateOfJoinParty = s.User.DateOfJoinParty,
                        HealthInsuranceNumber = s.User.HealthInsuranceNumber,
                        HealthInsuranceRegistrationPlace = s.User.HealthInsuranceRegistrationPlace,

                        Nationality = s.User.Nationality,
                        Ethnicity = s.User.Ethnicity,
                        TemporaryAddress = s.User.TemporaryAddress,
                        BirthCertWard = s.User.BirthCertWard,
                        BirthCertDistrict = s.User.BirthCertDistrict,
                        BirthCertProvince = s.User.BirthCertProvince,
                        HometownWard = s.User.HometownWard,
                        HometownDistrict = s.User.HometownDistrict,
                        HometownProvince =  s.User.HometownProvince,

                        BirthDistrict = s.User.BirthDistrict,
                        BirthProvince = s.User.BirthProvince,
                        BirthWard = s.User.BirthWard,

                        PermanentDistrict = s.User.PermanentDistrict,
                        PermanentProvince = s.User.PermanentProvince,
                        PermanentWard = s.User.PermanentWard,
                        IssuedPlace = s.User.IssuedPlace,
                        BankAccount = s.User.BankAccounts
                          .Where(b => b.IsDefault == true)
                         .Select(b => new BankAccountResponse
                         {
                             Id = b.Id,
                             UserId = b.Id,
                             AccountNumber = b.AccountNumber,
                             BankName = b.BankName,
                             Branch = b.Branch,
                             AccountHolderName = b.AccountHolderName,
                             IsDefault = b.IsDefault,
                             BankCode = b.BankCode,
                             AccountStatus = b.AccountStatus,
                             DateCreateAccount = b.DateCreateAccount
                         }).FirstOrDefault(),
                        Religion = s.User.Religion,
                        Gender = s.User.Gender
                    },
                    ClassName = s.Class.ClassName,
                    ProgramId = s.Class.Program.AcademicProgramId,  
                    ProgramName = s.Class.Program.ProgramName,
                    DepartmentName = s.Class.Program.Department.DepartmentName,
                    TrainningLevel = s.Class.Program.DegreeLevel,
                    YearOfAdmission = s.YearOfAdmission,
                    TotalCreditsRequired = s.Class.Program.CreditsRequired,
                    DateOfAdmission = s.DateOfAdmission
                })
                .FirstOrDefaultAsync();
        }

        public async Task<StudentDetailDto?> UpdateStudentInformationAsync(string mssv, StudentUpdateRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                // Get student with all related data
                var student = await context.Students
                    .Include(s => s.User)
                        .ThenInclude(u => u.BankAccounts)
                    .Include(s => s.Class)
                        .ThenInclude(c => c.Program)
                            .ThenInclude(p => p.Department)
                    .FirstOrDefaultAsync(s => s.MSSV == mssv);

                if (student == null)
                {
                    return null;
                }

                // Update User Information
                student.User.FullName = request.FullName;
                student.User.Email = request.Email;
                student.User.Phone = request.Phone;
                student.User.Gender = request.Gender;
                student.User.Address = request.Address;

                student.User.BirthProvince = request.BirthProvince;
                student.User.BirthWard = request.BirthWard;
                student.User.BirthDistrict = request.BirthDistrict;

                student.User.BirthCertProvince = request.BirthCertProvince;
                student.User.BirthCertDistrict = request.BirthCertDistrict;
                student.User.BirthCertWard = request.BirthCertWard;

                student.User.HometownProvince = request.HometownProvince;
                student.User.HometownDistrict = request.HometownDistrict;
                student.User.HometownWard = request.HometownWard;

                student.User.PermanentProvince = request.PermanentProvince;
                student.User.PermanentDistrict = request.PermanentDistrict;
                student.User.PermanentWard = request.PermanentWard;

                student.User.TemporaryAddress = request.TemporaryAddress;
                student.User.Ethnicity = request.Ethnicity;
                student.User.Nationality = request.Nationality;
                student.User.HealthInsuranceNumber = request.HealthInsuranceNumber;
                student.User.HealthInsuranceRegistrationPlace = request.RegisteredHospital;

                student.User.Religion = request.Religion;
                student.User.DateOfBirth = request.DateOfBirth;
                student.User.CitizenIdCard = request.CitizenIdCard;
                student.User.IssuedDate = request.IssuedDate;
                student.User.IssuedPlace = request.IssuedPlace;
                student.User.Object = request.Object;
                student.User.PolicyArea = request.PolicyArea;
                student.User.DateOfJoinUnion = request.DateOfJoinUnion;
                student.User.DateOfJoinParty = request.DateOfJoinParty;

                // Update avatar if provided
                if (!string.IsNullOrEmpty(request.AvatarUrl))
                {
                    student.User.AvatarUrl = request.AvatarUrl;
                }

                // Save changes
                context.Students.Update(student);
                await context.SaveChangesAsync();

                // Commit transaction
                await transaction.CommitAsync();

                // Return updated student information
                return new StudentDetailDto
                {
                    StudentId = student.Id,
                    MSSV = student.MSSV,
                    User = new UserResponse
                    {
                        Username = student.User.Username,
                        FullName = student.User.FullName,
                        Email = student.User.Email,
                        Phone = student.User.Phone,
                        Address = student.User.Address,
                        AccountStatus = student.User.AccountStatus,
                        AvatarUrl = student.User.AvatarUrl,
                        Role = student.User.Role,
                        PlaceOfBirth = student.User.PlaceOfBirth,
                        DateOfBirth = student.User.DateOfBirth,
                        CitizenIdCard = student.User.CitizenIdCard,
                        IssuedDate = student.User.IssuedDate,
                        Object = student.User.Object,
                        PolicyArea = student.User.PolicyArea,
                        DateOfJoinUnion = student.User.DateOfJoinUnion,
                        DateOfJoinParty = student.User.DateOfJoinParty,

                        HealthInsuranceNumber= student.User.HealthInsuranceNumber,
                        HealthInsuranceRegistrationPlace= student.User.HealthInsuranceRegistrationPlace,
                        
                        Nationality= student.User.Nationality,
                        Ethnicity= student.User.Ethnicity,
                        TemporaryAddress= student.User.TemporaryAddress,
                        BirthCertWard= student.User.BirthCertWard,
                        BirthCertDistrict= student.User.BirthCertDistrict,
                        BirthCertProvince= student.User.BirthCertProvince,
                        HometownWard= student.User.HometownWard,
                        HometownDistrict= student.User.HometownDistrict,
                        HometownProvince= student.User.HometownProvince,

                        BirthDistrict= student.User.BirthDistrict,
                        BirthProvince= student.User.BirthProvince,
                        BirthWard= student.User.BirthWard,

                        PermanentDistrict= student.User.PermanentDistrict,
                        PermanentProvince= student.User.PermanentProvince,
                        PermanentWard= student.User.PermanentWard,
                        IssuedPlace = student.User.IssuedPlace,

                        BankAccount = student.User.BankAccounts
                          .Where(b => b.IsDefault == true)
                         .Select(b => new BankAccountResponse
                         {
                             Id = b.Id,
                             UserId = b.Id,
                             AccountNumber = b.AccountNumber,
                             BankName = b.BankName,
                             Branch = b.Branch,
                             AccountHolderName = b.AccountHolderName,
                             IsDefault = b.IsDefault,
                             BankCode = b.BankCode,
                             AccountStatus = b.AccountStatus,
                             DateCreateAccount = b.DateCreateAccount
                         }).FirstOrDefault(),
                        Religion = student.User.Religion,
                        Gender = student.User.Gender
                    },
                    ClassName = student.Class.ClassName,
                    ProgramName = student.Class.Program.ProgramName,
                    DepartmentName = student.Class.Program.Department.DepartmentName,
                    TrainningLevel = student.Class.Program.DegreeLevel,
                    YearOfAdmission = student.YearOfAdmission,
                    TotalCreditsRequired = student.Class.Program.CreditsRequired,
                    DateOfAdmission = student.DateOfAdmission

                };
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


       
    }
}