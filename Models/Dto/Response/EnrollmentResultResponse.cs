namespace StudentManagement.Models.Dto.Response
{
    public class EnrollmentResultResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? EnrollmentId { get; set; }
        public EnrollmentDetailInfo? EnrollmentDetails { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class EnrollmentDetailInfo
    {
        public int EnrollmentId { get; set; }
        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string LecturerName { get; set; } = string.Empty;
        public string SemesterName { get; set; } = string.Empty;
        public DateTime RegisteredAt { get; set; }
        public string EnrollmentStatus { get; set; } = string.Empty;
    }
}