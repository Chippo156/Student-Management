using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

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
        Task<IEnumerable<Grade>> GetGradesBySemeterAndStudentAsync(int semeter, int studentId);
        Task<IEnumerable<StudentSectionGradesResponse>> GetStudentSemesterGradesBySectionsAsync(string mssv, int semesterId);
        Task<StudentAllGradesResponse> GetAllStudentGradesByMSSVAsync(string mssv);
        Task<StudentSectionAllGradesResponse> GetAllGradesByStudentAndSectionAsync(int studentId, int sectionId);
    }
}