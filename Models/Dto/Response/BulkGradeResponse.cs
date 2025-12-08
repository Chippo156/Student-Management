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
        public int? GradeId { get; set; }
        public double? Score { get; set; }
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }

        // **NEW: Track operation type**
        public string Operation { get; set; } = ""; // "Created", "Updated", "Failed"
    }
}