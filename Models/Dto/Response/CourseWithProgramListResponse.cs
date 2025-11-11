namespace StudentManagement.Models.Dto.Response
{
    public class CourseWithProgramListResponse
    {
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public int TotalCredits { get; set; }
        
        // Danh sách chương trình có môn này
        public List<SimpleProgramResponse> Programs { get; set; } = new();
        
        // Thống kê đơn giản
        public int TotalPrograms { get; set; }
    }

    public class SimpleProgramResponse
    {
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string ProgramCode { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public int SemesterSuggested { get; set; }
    }
}