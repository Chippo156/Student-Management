using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models
{
    public class TuitionFeeDetail
    {
        [Key]
        public int DetailId { get; set; }
        
        public int TuitionFeeId { get; set; }
        public TuitionFee TuitionFee { get; set; } = null!;
        
        public int? SectionId { get; set; } // Nếu là học phí theo môn học
        public Section? Section { get; set; }
        
        public string ItemName { get; set; } = string.Empty; // Tên khoản phí
        public string ItemType { get; set; } = string.Empty; // Loại phí (Tuition, Lab, Activity, etc.)
        public int Credits { get; set; } // Số tín chỉ
        public decimal UnitPrice { get; set; } // Giá per tín chỉ
        public decimal Amount { get; set; } // Tổng tiền = Credits * UnitPrice
        public string? Description { get; set; }
    }
}