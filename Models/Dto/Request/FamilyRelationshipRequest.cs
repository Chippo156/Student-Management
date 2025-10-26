using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class FamilyRelationshipRequest
    {
        
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        public RelationshipType RelationshipType { get; set; }
        
        public DateOnly? DateOfBirth { get; set; }
        
        [StringLength(15)]
        public string? Phone { get; set; }
        
        [StringLength(100)]
        [EmailAddress]
        public string? Email { get; set; }
        
        [StringLength(200)]
        public string? Address { get; set; }
        
        [StringLength(100)]
        public string? Occupation { get; set; }
        
        [StringLength(100)]
        public string? Workplace { get; set; }
        
        [StringLength(20)]
        public string? CitizenIdCard { get; set; }
        
        public DateOnly? IssuedDate { get; set; }
        
        [StringLength(100)]
        public string? IssuedPlace { get; set; }
        
        public bool IsGuardian { get; set; } = false;
    }
}