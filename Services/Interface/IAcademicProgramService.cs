using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IAcademicProgramService
    {
        Task<AcademicProgram?> GetProgramByIdAsync(int programId);
        Task<IEnumerable<AcademicProgram>> GetAllProgramsAsync();
        Task<AcademicProgram> CreateProgramAsync(AcademicProgramRequest request);
        Task<AcademicProgram?> UpdateProgramAsync(int programId, AcademicProgramRequest request);
        Task<bool> DeleteProgramAsync(int programId);
        Task<IEnumerable<AcademicProgram>> GetProgramsByDepartmentAsync(int departmentId);
    }
}