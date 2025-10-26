using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;
using System.Net;

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

        [StringLength(100)]
        public string? Occupation { get; set; }

        [StringLength(100)]
        public string? Workplace { get; set; }

        [StringLength(20)]
        public string? CitizenIdCard { get; set; }

        public DateOnly? IssuedDate { get; set; }

        [StringLength(100)]
        public string? IssuedPlace { get; set; }

        // --- Địa chỉ chi tiết ---
        [StringLength(200)]
        public string? PermanentAddress { get; set; } // Hộ khẩu thường trú (text mô tả)

        [StringLength(100)]
        public string? Province { get; set; }

        [StringLength(100)]
        public string? District { get; set; }

        [StringLength(100)]
        public string? Ward { get; set; }

        [StringLength(200)]
        public string? DetailAddress { get; set; }


        // --- Cờ trạng thái ---
        public bool IsGuardian { get; set; } = false; // Là người giám hộ?
        public bool IsDeceased { get; set; } = false; // Đã mất?
        public bool IsHouseholder { get; set; } = false; // Là chủ hộ?

        // --- Thời gian tạo/cập nhật ---
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
