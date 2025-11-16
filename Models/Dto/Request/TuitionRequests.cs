using System.ComponentModel.DataAnnotations;
using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Request
{
    public class ProcessPaymentRequest
    {
        [Required]
        public int TuitionFeeId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Payment amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public PaymentMethod PaymentMethod { get; set; }
        
        public string? TransactionId { get; set; }
        public string? PaymentReference { get; set; }
        public string? Note { get; set; }
    }

    public class TuitionSearchRequest : PaginationParams
    {
        public string? StudentMSSV { get; set; }
        public int? SemesterId { get; set; }
        public TuitionStatus? Status { get; set; }
        public bool? IsOverdue { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class GenerateTuitionRequest
    {
        [Required]
        public int SemesterId { get; set; }
        
        public int? DepartmentId { get; set; } // Nếu null sẽ tạo cho tất cả departments
        public bool IncludeExistingStudents { get; set; } = true;
    }
}