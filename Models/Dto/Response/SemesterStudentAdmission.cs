namespace StudentManagement.Models.Dto.Response
{
    public class SemesterStudentAdmission
    {
        public int SemesterId { get; set; }
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public bool isSemesterActive { get; set; }
    }
}
