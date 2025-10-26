using StudentManagement.Enum;
using StudentManagement.Models.Embed;

namespace StudentManagement.Models
{
    public class User
    {
        public int UserId { get; set; }

        // --- Thông tin tài khoản ---
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Role Role { get; set; } = null!;
        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
        public string? RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // --- Thông tin cá nhân ---
        public string FullName { get; set; } = string.Empty;
        public Gender Gender { get; set; } = Gender.MALE;
        public DateOnly? DateOfBirth { get; set; }

        public string? Ethnicity { get; set; } // Dân tộc
        public string? Nationality { get; set; } // Quốc tịch

        public string? CitizenIdCard { get; set; } // Số CCCD/CMND
        public DateOnly? IssuedDate { get; set; } // Ngày cấp
        public string? IssuedPlace { get; set; } // Nơi cấp

        public string? HealthInsuranceNumber { get; set; } // Mã số BHYT
        public string? HealthInsuranceRegistrationPlace { get; set; } // Nơi đăng ký KCB ban đầu

        public string? Email { get; set; } = string.Empty;
        public string? Phone { get; set; } = string.Empty;

        public string? Address { get; set; } = string.Empty; // Địa chỉ liên hệ
        public string? TemporaryAddress { get; set; } // Địa chỉ tạm trú (nếu có)

        public string? PlaceOfBirth { get; set; } // Nơi sinh (tổng quát)
        public string? Religion { get; set; } // Tôn giáo (nếu cần)
        public string AvatarUrl { get; set; } = string.Empty;

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

        // --- Thông tin mở rộng ---
        public string? Object { get; set; } = string.Empty;
        public string? PolicyArea { get; set; }
        public DateOnly? DateOfJoinUnion { get; set; }
        public DateOnly? DateOfJoinParty { get; set; }

        // --- Liên kết ---
        public ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
    }
}
