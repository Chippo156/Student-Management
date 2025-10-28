namespace StudentManagement.Models
{
    public class PracticeGroup
    {
        public int PracticeGroupId { get; set; }
        public string GroupName { get; set; } = null!;  // "Nhóm 1", "A", "B" ...
        // Mối quan hệ với Schedule
        public int ScheduleId { get; set; }
        public Schedule Schedule { get; set; } = null!;

        // Danh sách sinh viên trong nhóm
    }
}
