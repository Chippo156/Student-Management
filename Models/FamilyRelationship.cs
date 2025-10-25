using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models
{
    public class FamilyRelationship
    {
        public int FamilyRelationshipId { get; set; }
        
        [Required]
        public Student Student { get; set; } = null!;
        
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        public RelationshipType RelationshipType { get; set; }
        
        public DateOnly? DateOfBirth { get; set; }
        
        [StringLength(15)]
        public string? Phone { get; set; }
        
        [StringLength(100)]
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
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}