using System.ComponentModel.DataAnnotations;
using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class TuitionPayment
    {
        [Key]
        public int PaymentId { get; set; }
        
        public int TuitionFeeId { get; set; }
        public TuitionFee TuitionFee { get; set; } = null!;
        
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Completed;
        
        public string? TransactionId { get; set; } // Mã giao dịch
        public string? PaymentReference { get; set; } // Số tham chiếu
        public string? Note { get; set; }
        
        // Thông tin người xử lý
        public int? ProcessedByUserId { get; set; }
        public User? ProcessedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}