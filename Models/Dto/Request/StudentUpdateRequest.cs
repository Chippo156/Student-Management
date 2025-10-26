using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class StudentUpdateRequest
    {
        // --- Thông tin cơ bản ---
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

        public DateOnly? DateOfBirth { get; set; }

        [StringLength(50)]
        public string? Ethnicity { get; set; } // Dân tộc

        [StringLength(50)]
        public string? Nationality { get; set; } // Quốc tịch

        [StringLength(50)]
        public string? Religion { get; set; }

        public string? AvatarUrl { get; set; }

        // --- Giấy tờ cá nhân ---
        [StringLength(20)]
        public string? CitizenIdCard { get; set; }

        public DateOnly? IssuedDate { get; set; }

        [StringLength(100)]
        public string? IssuedPlace { get; set; }

        // --- Mã BHYT & nơi đăng ký khám chữa bệnh ---
        [StringLength(50)]
        public string? HealthInsuranceNumber { get; set; }

        [StringLength(200)]
        public string? RegisteredHospital { get; set; }

        // --- Quê quán ---
        public string? HometownProvince { get; set; }
        public string? HometownDistrict { get; set; }
        public string? HometownWard { get; set; }

        // --- Nơi sinh ---
        public string? BirthProvince { get; set; }
        public string? BirthDistrict { get; set; }
        public string? BirthWard { get; set; }

        // --- Nơi cấp giấy khai sinh ---
        public string? BirthCertProvince { get; set; }
        public string? BirthCertDistrict { get; set; }
        public string? BirthCertWard { get; set; }

        // --- Nơi đăng ký hộ khẩu thường trú ---
        public string? PermanentProvince { get; set; }
        public string? PermanentDistrict { get; set; }
        public string? PermanentWard { get; set; }

        // --- Địa chỉ ---
        [StringLength(200)]
        public string? TemporaryAddress { get; set; } // Địa chỉ tạm trú (nếu có)

        [StringLength(200)]
        public string? ContactAddress { get; set; } // Địa chỉ liên hệ

        [StringLength(200)]
        public string? Address { get; set; } // Có thể dùng để hiển thị chung

        // --- Các thông tin khác ---
        [StringLength(50)]
        public string? Object { get; set; }

        [StringLength(100)]
        public string? PolicyArea { get; set; }

        public DateOnly? DateOfJoinUnion { get; set; }

        public DateOnly? DateOfJoinParty { get; set; }
    }
}
