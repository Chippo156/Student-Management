using StudentManagement.Enum;
using StudentManagement.Models.Embed;

namespace StudentManagement.Models.Dto.Response
{
    public class UserResponse
    {
        public required string Username { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public string? Address { get; set; } = string.Empty; // Địa chỉ liên hệ
        public string? TemporaryAddress { get; set; } // Địa chỉ tạm trú (nếu có)
        public string? AvatarUrl { get; set; }
        public Gender Gender { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? Religion { get; set; }
        public DateOnly? DateOfBirth { get; set; }

        public string? CitizenIdCard { get; set; } = string.Empty;
        public DateOnly? IssuedDate { get; set; }
        public string? IssuedPlace { get; set; } = string.Empty;
        public string? Object { get; set; } = string.Empty;
        public string? PolicyArea { get; set; }
        public DateOnly? DateOfJoinUnion { get; set; }
        public DateOnly? DateOfJoinParty { get; set; }
        public BankAccountResponse? BankAccount { get; set; }
        public string? Ethnicity { get; set; } // Dân tộc
        public string? Nationality { get; set; } // Quốc tịch
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

        public string? HealthInsuranceNumber { get; set; } // Mã số BHYT
        public string? HealthInsuranceRegistrationPlace { get; set; } // Nơi đăng ký KCB ban đầu


        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
        public required Role Role { get; set; }
    }
}
