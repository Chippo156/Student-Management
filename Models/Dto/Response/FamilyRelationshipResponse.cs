using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class FamilyRelationshipResponse
    {
        public int FamilyRelationshipId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public RelationshipType RelationshipType { get; set; }
        public string RelationshipTypeName { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public int? Age { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? Occupation { get; set; }
        public string? Workplace { get; set; }
        public string? CitizenIdCard { get; set; }
        public DateOnly? IssuedDate { get; set; }
        public string? IssuedPlace { get; set; }
        public bool IsGuardian { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}