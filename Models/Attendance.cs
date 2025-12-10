using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class Attendance
    {
        public int AttendanceId { get; set; }
        
        // Student information
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;
        
        // Section information
        public int SectionId { get; set; }
        public Section Section { get; set; } = null!;
        
        // Attendance session information
        public int AttendanceSessionId { get; set; }
        public AttendanceSession AttendanceSession { get; set; } = null!;
        
        // Attendance details
        public AttendanceStatus Status { get; set; }
        public DateTime RecordedAt { get; set; } = DateTime.Now;
        public string? Note { get; set; }
        
        // Who recorded this attendance
        public int? RecordedByLecturerId { get; set; }
        public Lecturer? RecordedByLecturer { get; set; }
    }

    public class AttendanceSession
    {
        public int AttendanceSessionId { get; set; }
        
        // Section information
        public int SectionId { get; set; }
        [JsonIgnore]
        public Section Section { get; set; } = null!;
        
        // Session information
        public DateTime SessionDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string SessionName { get; set; } = string.Empty; // "Buổi 1", "Thực hành 1", etc.
        public string? Description { get; set; }
        public string? Room { get; set; }
        
        // Session status
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int CreatedByLecturerId { get; set; }
        [JsonIgnore]
        public Lecturer CreatedByLecturer { get; set; } = null!;
        
        // Practice group (if applicable)
        public int? PracticeGroupId { get; set; }
        public PracticeGroup? PracticeGroup { get; set; }

        public bool AllowSelfCheckIn { get; set; } = false;
        public DateTime? SelfCheckInStartTime { get; set; }
        public DateTime? SelfCheckInEndTime { get; set; }
        public string? CheckInCode { get; set; } // 6-digit code for verification

        // Attendance records for this session
        [JsonIgnore]
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    }
}