using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class TuitionFeeResponse
    {
        public int TuitionFeeId { get; set; }
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        
        public TuitionStatus Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        
        public bool IsLate { get; set; }
        public decimal LateFee { get; set; }
        
        public int TotalCredits { get; set; }
        public int PaymentCount { get; set; }
        
        public List<TuitionFeeDetailResponse> Details { get; set; } = new();
        public List<TuitionPaymentResponse> Payments { get; set; } = new();
    }

    public class TuitionPaymentResponse
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string PaymentMethodName { get; set; } = string.Empty;
        public PaymentStatus PaymentStatus { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string PaymentReference { get; set; } = string.Empty;
        public string? Note { get; set; }
        public string ProcessedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class TuitionFeeDetailResponse
    {
        public int DetailId { get; set; }
        public int? SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public int Credits { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    public class StudentTuitionSummaryResponse
    {
        public int StudentId { get; set; }
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ProgramName { get; set; } = string.Empty;
        
        public decimal TotalTuitionAllSemesters { get; set; }
        public decimal TotalPaidAllSemesters { get; set; }
        public decimal TotalRemainingAllSemesters { get; set; }
        
        public int TotalSemestersWithDebt { get; set; }
        public int TotalOverdueSemesters { get; set; }
        
        public List<SemesterTuitionInfo> SemesterTuitions { get; set; } = new();
    }

    public class SemesterTuitionInfo
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public TuitionStatus Status { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsOverdue { get; set; }
    }
}