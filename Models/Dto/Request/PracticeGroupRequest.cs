using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class PracticeGroupRequest
    {
        [Required]
        [StringLength(50)]
        public string GroupName { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Description { get; set; }

        [Required]
        [Range(1, 100)]
        public int MaxCapacity { get; set; } = 20;

        [Required]
        public int SectionId { get; set; }
    }
}