using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class FamilyRelationshipResponse
    {
        public int FamilyRelationshipId { get; set; }

        // --- Thông tin cơ bản ---
        public string FullName { get; set; } = string.Empty;
        public RelationshipType RelationshipType { get; set; }
        public string RelationshipTypeName { get; set; } = string.Empty;

        public DateOnly? DateOfBirth { get; set; }
        public int? Age { get; set; }

        public string? Phone { get; set; }
        public string? Email { get; set; }

        // --- Nghề nghiệp, nơi làm việc ---
        public string? Occupation { get; set; }
        public string? Workplace { get; set; }

        // --- CMND/CCCD ---
        public string? CitizenIdCard { get; set; }
        public DateOnly? IssuedDate { get; set; }
        public string? IssuedPlace { get; set; }

        // --- Địa chỉ ---
        public string? Province { get; set; }        // Tỉnh/Thành phố
        public string? District { get; set; }        // Huyện/Quận
        public string? Ward { get; set; }            // Xã/Phường
        public string? DetailAddress { get; set; }   // Địa chỉ chi tiết
        public string? PermanentAddress { get; set; } // Hộ khẩu thường trú

        // --- Cờ trạng thái ---
        public bool IsGuardian { get; set; }         // Là người giám hộ
        public bool IsDeceased { get; set; }         // Đã mất
        public bool IsHouseholder { get; set; }      // Là chủ hộ

        // --- Hệ thống ---
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // --- Tiện ích ---
        public string? FullAddress
        {
            get
            {
                var parts = new[] { DetailAddress, Ward, District, Province }
                    .Where(x => !string.IsNullOrWhiteSpace(x));
                return string.Join(", ", parts);
            }
        }
    }
}
