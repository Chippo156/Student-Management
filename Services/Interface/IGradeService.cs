using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IGradeService
    {
        Task<Grade> CreateGradeAsync(GradeRequest request);
        Task<Grade?> UpdateGradeAsync(int gradeId, GradeRequest request);
        Task<bool> DeleteGradeAsync(int gradeId);
        Task<IEnumerable<Grade>> GetGradesByStudentAsync(int studentId);
        Task<IEnumerable<Grade>> GetGradesByAssessmentAsync(int assessmentId);
        Task<IEnumerable<Grade>> GetGradesBySectionAndStudentAsync(int sectionId, int studentId);
    }
}