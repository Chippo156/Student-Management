namespace StudentManagement.Models
{
    public class CurriculumCourse
    {
        public int Id { get; set; }
        public AcademicProgram Program { get; set; } = null!;
        public Course Course { get; set; } = null!;
        public Boolean isRequired { get; set; }
        public int SemeterSuggested { get; set; }
    }
}
