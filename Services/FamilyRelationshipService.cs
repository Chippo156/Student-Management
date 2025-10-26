using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class FamilyRelationshipService(AppDbContext context) : IFamilyRelationshipService
    {
        public async Task<FamilyRelationship> CreateFamilyRelationshipAsync(string mssv, FamilyRelationshipRequest request)
        {
            var student = await context.Students
                .FirstOrDefaultAsync(s => s.MSSV == mssv)
                ?? throw new Exception("Student not found");

            var familyRelationship = new FamilyRelationship
            {
                Student = student,
                FullName = request.FullName,
                RelationshipType = request.RelationshipType,
                DateOfBirth = request.DateOfBirth,
                Phone = request.Phone,
                Email = request.Email,
                Address = request.Address,
                Occupation = request.Occupation,
                Workplace = request.Workplace,
                CitizenIdCard = request.CitizenIdCard,
                IssuedDate = request.IssuedDate,
                IssuedPlace = request.IssuedPlace,
                IsGuardian = request.IsGuardian
            };

            context.FamilyRelationships.Add(familyRelationship);
            await context.SaveChangesAsync();
            return familyRelationship;
        }

        public async Task<bool> DeleteFamilyRelationshipAsync(int familyRelationshipId)
        {
            var familyRelationship = await context.FamilyRelationships.FindAsync(familyRelationshipId);
            if (familyRelationship == null)
                return false;

            context.FamilyRelationships.Remove(familyRelationship);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<FamilyRelationshipResponse?> GetFamilyRelationshipByIdAsync(int familyRelationshipId)
        {
            var familyRelationship = await context.FamilyRelationships
                .FirstOrDefaultAsync(fr => fr.FamilyRelationshipId == familyRelationshipId);

            return familyRelationship != null ? MapToResponse(familyRelationship) : null;
        }

        public async Task<IEnumerable<FamilyRelationshipResponse>> GetFamilyRelationshipsByStudentAsync(string mssv)
        {
            var fa = await context.FamilyRelationships
                .Where(fr => fr.Student.MSSV == mssv)
                .Select(fr => MapToResponse(fr))
                .ToListAsync();
            return fa;
        }


        public async Task<FamilyRelationship?> UpdateFamilyRelationshipAsync(string mssv, int familyRelationshipId, FamilyRelationshipRequest request)
        {
            var familyRelationship = await context.FamilyRelationships.FindAsync(familyRelationshipId);
            if (familyRelationship == null)
                return null;

            // Update properties
            familyRelationship.FullName = request.FullName;
            familyRelationship.RelationshipType = request.RelationshipType;
            familyRelationship.DateOfBirth = request.DateOfBirth;
            familyRelationship.Phone = request.Phone;
            familyRelationship.Email = request.Email;
            familyRelationship.Address = request.Address;
            familyRelationship.Occupation = request.Occupation;
            familyRelationship.Workplace = request.Workplace;
            familyRelationship.CitizenIdCard = request.CitizenIdCard;
            familyRelationship.IssuedDate = request.IssuedDate;
            familyRelationship.IssuedPlace = request.IssuedPlace;
            familyRelationship.IsGuardian = request.IsGuardian;
            familyRelationship.UpdatedAt = DateTime.UtcNow;

            context.FamilyRelationships.Update(familyRelationship);
            await context.SaveChangesAsync();
            return familyRelationship;
        }

        private static FamilyRelationshipResponse MapToResponse(FamilyRelationship fr)
        {
            var label = fr.RelationshipType.ToVietnamese();
            return new FamilyRelationshipResponse
            {
                FamilyRelationshipId = fr.FamilyRelationshipId,
                FullName = fr.FullName,
                RelationshipType = fr.RelationshipType,
                RelationshipTypeName = label,
                DateOfBirth = fr.DateOfBirth,
                Age = fr.DateOfBirth.HasValue ? DateTime.Now.Year - fr.DateOfBirth.Value.Year : null,
                Phone = fr.Phone,
                Email = fr.Email,
                Address = fr.Address,
                Occupation = fr.Occupation,
                Workplace = fr.Workplace,
                CitizenIdCard = fr.CitizenIdCard,
                IssuedDate = fr.IssuedDate,
                IssuedPlace = fr.IssuedPlace,
                IsGuardian = fr.IsGuardian,
                CreatedAt = fr.CreatedAt
            };
        }
    }
}