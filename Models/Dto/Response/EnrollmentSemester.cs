namespace StudentManagement.Models.Dto.Response
{
    public class EnrollmentSemester
    {
        public string courseCode { get; set; } = string.Empty;
        public string courseName { get; set; } = string.Empty;
        public int creditsTheory { get; set; }
        public int creditsLab { get; set; }
    }
}
