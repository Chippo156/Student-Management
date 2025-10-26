using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;

namespace StudentManagement.Services.Interface
{
    public interface IFamilyRelationshipService
    {
        Task<FamilyRelationship> CreateFamilyRelationshipAsync(string mssv, FamilyRelationshipRequest request);
        Task<FamilyRelationship?> UpdateFamilyRelationshipAsync(string mssv, int familyRelationshipId, FamilyRelationshipRequest request);
        Task<bool> DeleteFamilyRelationshipAsync(int familyRelationshipId);
        Task<FamilyRelationshipResponse?> GetFamilyRelationshipByIdAsync(int familyRelationshipId);
        Task<IEnumerable<FamilyRelationshipResponse>> GetFamilyRelationshipsByStudentAsync(string mssv);
    }
}