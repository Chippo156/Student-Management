using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class AcademicProgramRequest
    {
        [Required(ErrorMessage = "Tên chương trình đào tạo là bắt buộc")]
        public string ProgramName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Trình độ đào tạo là bắt buộc")]
        public string DegreeLevel { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mã khoa là bắt buộc")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Số tín chỉ yêu cầu là bắt buộc")]
        public int CreditsRequired { get; set; }
    }
}