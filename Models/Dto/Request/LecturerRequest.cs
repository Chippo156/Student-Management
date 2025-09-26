namespace StudentManagement.Models.Dto.Request
{
    public class LecturerRequest
    {
        public string Position { get; set; } = string.Empty;
        public string AcademicTitle { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int DepartmentId { get; set; }
    }
}