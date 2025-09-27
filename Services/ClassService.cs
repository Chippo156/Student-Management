using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class ClassService(AppDbContext context) : IClassService
    {
        public Task<Class> CreateClassAsync(ClassRequest classRequest)
        {
            Class newClass = new Class
            {
                ClassName = classRequest.ClassName
            };
            
            var program = context.Programs.Find(classRequest.ProgramId);
            if (program is null)
            {
                throw new Exception("Program not found");
            }
            newClass.Program = program;

            context.Classes.Add(newClass);
            context.SaveChanges();
            return Task.FromResult(newClass);
        }

        public Task<bool> DeleteClassAsync(int classId)
        {
            Class classEntity = context.Classes.Find(classId) ?? throw new Exception("Class not found");
            context.Classes.Remove(classEntity);
            return Task.FromResult(context.SaveChanges() > 0);
        }

        public Task<IEnumerable<Class>> GetAllClassesAsync()
        {
            return Task.FromResult(context.Classes.AsEnumerable());
        }

        public Task<Class?> GetClassByIdAsync(int classId)
        {
            Class? classEntity = context.Classes.Find(classId);
            return Task.FromResult(classEntity);
        }

        public Task<Class?> UpdateClassAsync(int classId, string className)
        {
            Class? classEntity = context.Classes.Find(classId);
            if (classEntity is null)
            {
                return Task.FromResult<Class?>(null);
            }

            classEntity.ClassName = className;

            context.Classes.Update(classEntity);
            context.SaveChanges();
            return Task.FromResult<Class?>(classEntity);
        }
    }
}