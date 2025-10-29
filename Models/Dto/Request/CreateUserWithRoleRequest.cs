using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class CreateUserWithRoleRequest
    {
        // Basic User Information
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public int RoleId { get; set; }

        [Required]
        public Gender Gender { get; set; }

        // Contact Information
        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        [Phone]
        [StringLength(15)]
        public string? Phone { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        [StringLength(200)]
        public string? TemporaryAddress { get; set; }

        // Personal Information
        public DateOnly? DateOfBirth { get; set; }

        [StringLength(50)]
        public string? Ethnicity { get; set; }

        [StringLength(50)]
        public string? Nationality { get; set; }

        [StringLength(20)]
        [RegularExpression(@"^\d{9}(\d{3})?$", ErrorMessage = "Citizen ID must be 9 or 12 digits")]
        public string? CitizenIdCard { get; set; }

        public DateOnly? IssuedDate { get; set; }

        [StringLength(100)]
        public string? IssuedPlace { get; set; }

        // Health Insurance
        [StringLength(20)]
        public string? HealthInsuranceNumber { get; set; }

        [StringLength(200)]
        public string? HealthInsuranceRegistrationPlace { get; set; }

        // Location Information
        [StringLength(100)]
        public string? PlaceOfBirth { get; set; }

        [StringLength(50)]
        public string? Religion { get; set; }

        // Address Details
        //[StringLength(100)]
        //public string? HometownProvince { get; set; }

        //[StringLength(100)]
        //public string? HometownDistrict { get; set; }

        //[StringLength(100)]
        //public string? HometownWard { get; set; }

        //[StringLength(100)]
        //public string? BirthProvince { get; set; }

        //[StringLength(100)]
        //public string? BirthDistrict { get; set; }

        //[StringLength(100)]
        //public string? BirthWard { get; set; }

        //[StringLength(100)]
        //public string? PermanentProvince { get; set; }

        //[StringLength(100)]
        //public string? PermanentDistrict { get; set; }

        //[StringLength(100)]
        //public string? PermanentWard { get; set; }

        // Additional Information
        [StringLength(100)]
        public string? Object { get; set; }

        [StringLength(100)]
        public string? PolicyArea { get; set; }

        public DateOnly? DateOfJoinUnion { get; set; }
        public DateOnly? DateOfJoinParty { get; set; }

        // Role-specific data
        public StudentSpecificData? StudentSpecificData { get; set; }
        public LecturerSpecificData? LecturerSpecificData { get; set; }
    }

    public class StudentSpecificData
    {
        //[Required]
        //[StringLength(20)]
        //public string MSSV { get; set; } = string.Empty;

        [Required]
        public int ClassId { get; set; }

        public StudentStatus? StudentStatus { get; set; }
        public DateOnly? AdmissionDate { get; set; }
        public int Year { get; set; }

        //public List<FamilyRelationshipData>? FamilyRelationships { get; set; }
    }

    public class LecturerSpecificData
    {
        //[Required]
        //[StringLength(20)]
        //public string LecturerCode { get; set; } = string.Empty;

        [Required]
        public int DepartmentId { get; set; }

        [StringLength(100)]
        public string? Position { get; set; }

        [StringLength(200)]
        public string? AcademicTitle { get; set; }

        public DateOnly? HireDate { get; set; }
        public decimal? Salary { get; set; }
    }

    public class FamilyRelationshipData
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
        public string? Email { get; set; }

        [StringLength(100)]
        public string? Occupation { get; set; }

        [StringLength(100)]
        public string? Workplace { get; set; }

        [StringLength(20)]
        public string? CitizenIdCard { get; set; }

        public DateOnly? IssuedDate { get; set; }

        [StringLength(100)]
        public string? IssuedPlace { get; set; }

        [StringLength(100)]
        public string? Province { get; set; }

        [StringLength(100)]
        public string? District { get; set; }

        [StringLength(100)]
        public string? Ward { get; set; }

        [StringLength(200)]
        public string? DetailAddress { get; set; }

        public bool IsGuardian { get; set; } = false;
        public bool IsDeceased { get; set; } = false;
        public bool IsHouseholder { get; set; } = false;
    }
}