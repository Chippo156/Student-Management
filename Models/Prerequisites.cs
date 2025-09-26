using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Models
{
    public class Prerequisite
    {
        public int Id { get; set; }

        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;

        public int PrerequisiteCourseId { get; set; }
        public Course PrerequisiteCourse { get; set; } = null!;
    }

}
