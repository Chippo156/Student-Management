namespace StudentManagement.Models.Dto.Response
{
    public class BulkGradeResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalProcessed { get; set; }
        public int SuccessfulCount { get; set; }
        public int FailedCount { get; set; }
        public List<GradeProcessResult> Results { get; set; } = new();
        public List<string> GeneralErrors { get; set; } = new();
    }

    public class GradeProcessResult
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string MSSV { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
        public int? GradeId { get; set; }
        public double? Score { get; set; }
    }
}