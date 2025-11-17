using System.Text.Json.Serialization;

namespace StudentManagement.Models
{
    public class PracticeGroup
    {
        public int PracticeGroupId { get; set; }
        public string GroupName { get; set; } = null!;  // "Nhóm 1", "A", "B" ...
        public string? Description { get; set; }
        public int MaxCapacity { get; set; } = 20; // Số sinh viên tối đa trong nhóm
        public int CurrentCount { get; set; } = 0; // Số sinh viên hiện tại

        // Mối quan hệ với Section
        public int SectionId { get; set; }
        [JsonIgnore]
        public Section Section { get; set; } = null!;

        // Danh sách sinh viên trong nhóm
        public ICollection<PracticeGroupEnrollment> PracticeGroupEnrollments { get; set; } = new List<PracticeGroupEnrollment>();

        // Danh sách lịch thực hành của nhóm
        [JsonIgnore]
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

        // Thông tin giáo viên dạy thực hành
        public int? LecturerId { get; set; }
        public Lecturer? Lecturer { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}
