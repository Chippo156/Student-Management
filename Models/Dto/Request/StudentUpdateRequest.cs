using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class StudentUpdateRequest
    {
        // Basic User Information
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(15)]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        public Gender Gender { get; set; }
        
        [StringLength(200)]
        public string Address { get; set; } = string.Empty;
        
        public string? AvatarUrl { get; set; }
        
        [StringLength(100)]
        public string? PlaceOfBirth { get; set; }
        
        [StringLength(50)]
        public string? Religion { get; set; }
        
        public DateOnly? DateOfBirth { get; set; }
        
        // Identity Information
        [StringLength(20)]
        public string? CitizenIdCard { get; set; }
        
        public DateOnly? IssuedDate { get; set; }
        
        [StringLength(100)]
        public string? IssuedPlace { get; set; }
        
        [StringLength(50)]
        public string? Object { get; set; }
        
        [StringLength(100)]
        public string? PolicyArea { get; set; }
        
        public DateOnly? DateOfJoinUnion { get; set; }
        
        public DateOnly? DateOfJoinParty { get; set; }
        
    }
}   