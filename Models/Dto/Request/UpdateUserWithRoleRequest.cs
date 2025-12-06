using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class UpdateUserWithRoleRequest
    {
        // Basic User Information
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public Gender Gender { get; set; }

        [Required]
        public int RoleId { get; set; }

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
        [RegularExpression(@"^(\d{9}|\d{12})$", ErrorMessage = "Citizen ID must be 9 or 12 digits")]
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

        //// Address Details
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

        // Avatar file upload
        //public IFormFile? AvatarFile { get; set; }

        // Role-specific data (chỉ update role-specific entities nếu có thay đổi)
        public UpdateStudentSpecificData? StudentSpecificData { get; set; }
        public UpdateLecturerSpecificData? LecturerSpecificData { get; set; }
    }

    public class UpdateStudentSpecificData
    {
        public int? ClassId { get; set; }
        public StudentStatus? StudentStatus { get; set; }
        public DateOnly? AdmissionDate { get; set; }
        public int? Year { get; set; }
    }

    public class UpdateLecturerSpecificData
    {
        public int? DepartmentId { get; set; }

        [StringLength(100)]
        public string? Position { get; set; }

        [StringLength(200)]
        public string? AcademicTitle { get; set; }
    }
}