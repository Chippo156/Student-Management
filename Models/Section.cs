using System.Text.Json.Serialization;

namespace StudentManagement.Models
{
    public class Section
    {
        public int SectionId { get; set; }
        public CurriculumCourse CurriculumCourse { get; set; } = null!;
        public Semester Semester { get; set; } = null!;
        public Lecturer Lecturer { get; set; } = null!;
        public Class Class { get; set; } = null!;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int Capacity { get; set; }
        [JsonIgnore]
        public ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();
    }
}
