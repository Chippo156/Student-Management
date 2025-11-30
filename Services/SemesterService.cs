using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class SemesterService(AppDbContext _context) : ISemesterService
    {


        public async Task<IEnumerable<SemesterStudentAdmission>> GetSemestersByStudentAdmissionAsync(string mssv)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with ID {mssv} not found");

            var currentYear = DateTime.Now.Year;

            var semesters = await _context.Semesters
                .Where(s => s.Year >= student.YearOfAdmission && s.Year <= currentYear)
                .OrderBy(s => s.Year)
                .ThenBy(s =>
                    s.Term == "Học kỳ 1" ? 1 :
                    s.Term == "Học kỳ 2" ? 2 : 3
                )
                .Select(s => new SemesterStudentAdmission
                {
                    SemesterId = s.SemesterId,
                    Year = s.Year,
                    Term = s.Term,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    isSemesterActive = (s.Year == currentYear &&
                                        (DateOnly.FromDateTime(DateTime.Now) >= s.StartDate &&
                                         DateOnly.FromDateTime(DateTime.Now) <= s.EndDate))
                })
                .ToListAsync();
            
            return semesters;
        }
        public async Task<IEnumerable<Semester>> GetSemestersByStudentAdmissionAndEnrollmentAsync(string mssv)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception($"Student with ID {mssv} not found");
            var currentYear = DateTime.Now.Year;

            var semesters = await _context.Semesters
                .Where(s => s.Year >= student.YearOfAdmission)
                .OrderByDescending(s => s.Year)
                .ThenBy(s =>
                    s.Term == "Học kỳ 1" ? 1 :
                    s.Term == "Học kỳ 2" ? 2 : 3 // Added default value for ternary operator
                )
                .ToListAsync();

            return semesters;

        }
    }
}
