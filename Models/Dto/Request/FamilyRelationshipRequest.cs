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

        [StringLength(100)]
        public string? Occupation { get; set; }

        [StringLength(100)]
        public string? Workplace { get; set; }

        [StringLength(20)]
        public string? CitizenIdCard { get; set; }

        public DateOnly? IssuedDate { get; set; }

        [StringLength(100)]
        public string? IssuedPlace { get; set; }

        // --- Địa chỉ ---
        [StringLength(100)]
        public string? Province { get; set; }       // Tỉnh/Thành phố

        [StringLength(100)]
        public string? District { get; set; }       // Quận/Huyện

        [StringLength(100)]
        public string? Ward { get; set; }           // Xã/Phường

        [StringLength(200)]
        public string? DetailAddress { get; set; }  // Số nhà, đường...

        [StringLength(200)]
        public string? PermanentAddress { get; set; } // Hộ khẩu thường trú

        // --- Cờ trạng thái ---
        public bool IsGuardian { get; set; } = false;   // Là người giám hộ?
        public bool IsDeceased { get; set; } = false;   // Đã mất?
        public bool IsHouseholder { get; set; } = false; // Là chủ hộ?
    }
}
