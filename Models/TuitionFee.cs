using System.ComponentModel.DataAnnotations;
using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class TuitionFee
    {
        [Key]
        public int TuitionFeeId { get; set; }
        
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;
        
        public int SemesterId { get; set; }
        public Semester Semester { get; set; } = null!;
        
        public decimal TotalAmount { get; set; } // Tổng học phí
        public decimal PaidAmount { get; set; } = 0; // Số tiền đã đóng
        public decimal RemainingAmount { get; set; } // Số tiền còn lại
        
        public TuitionStatus Status { get; set; } = TuitionStatus.Pending;
        public DateTime DueDate { get; set; } // Hạn đóng học phí
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? PaidAt { get; set; } // Ngày đóng hoàn thành
        
        // Thông tin bổ sung
        public string? Note { get; set; }
        public bool IsLate { get; set; } = false; // Đóng trễ
        public decimal? LateFee { get; set; } = 0; // Phí trễ hạn
        
        // Navigation properties
        public ICollection<TuitionPayment> Payments { get; set; } = new List<TuitionPayment>();
        public ICollection<TuitionFeeDetail> Details { get; set; } = new List<TuitionFeeDetail>();
    }
}