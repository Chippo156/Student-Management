using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class FacultyService(AppDbContext context) : IFacultyService
    {
        public Task<Faculty> CreateFacultyAsync(FacultyRequest faculty)
        {
           Faculty newFaculty = new Faculty
            {
                FacultyName = faculty.Name,
                Description = faculty.Description,
            };
            context.Falcuties.Add(newFaculty);
            context.SaveChanges();
            return Task.FromResult(newFaculty);
        }

        public Task<bool> DeleteFacultyAsync(int facultyId)
        {
            Faculty faculty = context.Falcuties.Find(facultyId) ?? throw new Exception("Faculty not found");
            context.Falcuties.Remove(faculty);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public Task<IEnumerable<Faculty>> GetAllFacultiesAsync()
        {
            return Task.FromResult(context.Falcuties.AsEnumerable());
        }

        public Task<Faculty?> GetFacultyByIdAsync(int facultyId)
        {
            Faculty? faculty = context.Falcuties.Find(facultyId);
            return Task.FromResult(faculty);
        }

        public Task<Faculty?> UpdateFacultyAsync(int facultyId, FacultyRequest faculty)
        {
            Faculty? faculty1 = context.Falcuties.Find(facultyId) ?? throw new Exception("Faculty not found");
            faculty1.FacultyName = faculty.Name;
            faculty1.Description = faculty.Description;
            context.Falcuties.Update(faculty1);
            context.SaveChanges();
            return Task.FromResult<Faculty?>(faculty1);
        }
    }
}
