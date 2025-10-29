using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class UpdateUserRequest
    {
        // --- Thông tin cá nhân cơ bản ---
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Gender is required")]
        public Gender Gender { get; set; }

        [DataType(DataType.Date)]
        public DateOnly? DateOfBirth { get; set; }

        [StringLength(50, ErrorMessage = "Ethnicity cannot exceed 50 characters")]
        public string? Ethnicity { get; set; }

        [StringLength(50, ErrorMessage = "Nationality cannot exceed 50 characters")]
        public string? Nationality { get; set; }

        // --- CMND/CCCD ---
        [StringLength(20, ErrorMessage = "Citizen ID card cannot exceed 20 characters")]
        [RegularExpression(@"^\d{9}(\d{3})?$", ErrorMessage = "Citizen ID card must be 9 or 12 digits")]
        public string? CitizenIdCard { get; set; }

        [DataType(DataType.Date)]
        public DateOnly? IssuedDate { get; set; }

        [StringLength(100, ErrorMessage = "Issued place cannot exceed 100 characters")]
        public string? IssuedPlace { get; set; }

        // --- BHYT ---
        [StringLength(20, ErrorMessage = "Health insurance number cannot exceed 20 characters")]
        public string? HealthInsuranceNumber { get; set; }

        [StringLength(200, ErrorMessage = "Health insurance registration place cannot exceed 200 characters")]
        public string? HealthInsuranceRegistrationPlace { get; set; }

        // --- Liên hệ ---
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [StringLength(15, ErrorMessage = "Phone number cannot exceed 15 characters")]
        public string? Phone { get; set; }

        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters")]
        public string? Address { get; set; }

        [StringLength(200, ErrorMessage = "Temporary address cannot exceed 200 characters")]
        public string? TemporaryAddress { get; set; }

        // --- Nơi sinh ---
        [StringLength(100, ErrorMessage = "Place of birth cannot exceed 100 characters")]
        public string? PlaceOfBirth { get; set; }

        [StringLength(50, ErrorMessage = "Religion cannot exceed 50 characters")]
        public string? Religion { get; set; }

        // Avatar file upload
        public IFormFile? AvatarFile { get; set; }

        // --- Quê quán ---
        //[StringLength(100)]
        //public string? HometownProvince { get; set; }

        //[StringLength(100)]
        //public string? HometownDistrict { get; set; }

        //[StringLength(100)]
        //public string? HometownWard { get; set; }

        //// --- Nơi sinh chi tiết ---
        //[StringLength(100)]
        //public string? BirthProvince { get; set; }

        //[StringLength(100)]
        //public string? BirthDistrict { get; set; }

        //[StringLength(100)]
        //public string? BirthWard { get; set; }

        //// --- Nơi cấp giấy khai sinh ---
        //[StringLength(100)]
        //public string? BirthCertProvince { get; set; }

        //[StringLength(100)]
        //public string? BirthCertDistrict { get; set; }

        //[StringLength(100)]
        //public string? BirthCertWard { get; set; }

        //// --- Hộ khẩu thường trú ---
        //[StringLength(100)]
        //public string? PermanentProvince { get; set; }

        //[StringLength(100)]
        //public string? PermanentDistrict { get; set; }

        //[StringLength(100)]
        //public string? PermanentWard { get; set; }

        // --- Thông tin mở rộng ---
        [StringLength(100)]
        public string? Object { get; set; }

        [StringLength(100)]
        public string? PolicyArea { get; set; }

        [DataType(DataType.Date)]
        public DateOnly? DateOfJoinUnion { get; set; }

        [DataType(DataType.Date)]
        public DateOnly? DateOfJoinParty { get; set; }

        // --- Validation tùy chỉnh ---
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var errors = new List<ValidationResult>();

            // Kiểm tra tuổi hợp lý
            if (DateOfBirth.HasValue)
            {
                var age = DateOnly.FromDateTime(DateTime.Now).Year - DateOfBirth.Value.Year;
                if (age < 16 || age > 100)
                {
                    errors.Add(new ValidationResult("Age must be between 16 and 100 years old", new[] { nameof(DateOfBirth) }));
                }
            }

            // Kiểm tra ngày cấp CMND/CCCD
            if (IssuedDate.HasValue && DateOfBirth.HasValue)
            {
                if (IssuedDate.Value < DateOfBirth.Value.AddYears(14))
                {
                    errors.Add(new ValidationResult("Issued date must be at least 14 years after date of birth", new[] { nameof(IssuedDate) }));
                }
            }

            // Kiểm tra ngày vào Đoàn/Đảng
            if (DateOfJoinUnion.HasValue && DateOfBirth.HasValue)
            {
                if (DateOfJoinUnion.Value < DateOfBirth.Value.AddYears(15))
                {
                    errors.Add(new ValidationResult("Date of joining union must be at least 15 years after date of birth", new[] { nameof(DateOfJoinUnion) }));
                }
            }

            if (DateOfJoinParty.HasValue && DateOfBirth.HasValue)
            {
                if (DateOfJoinParty.Value < DateOfBirth.Value.AddYears(18))
                {
                    errors.Add(new ValidationResult("Date of joining party must be at least 18 years after date of birth", new[] { nameof(DateOfJoinParty) }));
                }
            }

            // Kiểm tra kích thước file avatar
            if (AvatarFile != null)
            {
                const long maxFileSize = 5 * 1024 * 1024; // 5MB
                if (AvatarFile.Length > maxFileSize)
                {
                    errors.Add(new ValidationResult("Avatar file size cannot exceed 5MB", new[] { nameof(AvatarFile) }));
                }

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(AvatarFile.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    errors.Add(new ValidationResult("Avatar file must be in JPG, JPEG, PNG, or GIF format", new[] { nameof(AvatarFile) }));
                }
            }

            return errors;
        }
    }
}