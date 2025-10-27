using StudentManagement.Enum;
using System.Text.Json.Serialization;

namespace StudentManagement.Models
{
    public class Section
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public CurriculumCourse CurriculumCourse { get; set; } = null!;
        public Semester Semester { get; set; } = null!;
        public Lecturer Lecturer { get; set; } = null!;
        public Class Class { get; set; } = null!;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int Capacity { get; set; }
        public int EnrolledCount { get; set; }
        public SectionStatus Status { get; set; } = SectionStatus.IsPreparing;
        [JsonIgnore]
        public ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();
        [JsonIgnore]
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        [JsonIgnore]
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    }
}
