using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class StudentTuitionDebtResponse
    {
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        
        // Thông tin tổng quan
        public decimal TotalDebt { get; set; }
        public decimal TotalLateFee { get; set; }
        public int TotalSemesters { get; set; }
        
        // Chi tiết công nợ theo học kỳ
        public List<SemesterTuitionDebt> SemesterDebts { get; set; } = new();
    }

    public class SemesterTuitionDebt
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        
        // Thông tin học phí của học kỳ
        public int TuitionFeeId { get; set; }
        public string TuitionFeeCode { get; set; } = string.Empty; // Mã học phí
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public decimal LateFee { get; set; }
        
        public DateTime DueDate { get; set; }
        public DateTime? PaidAt { get; set; }
        public bool IsOverdue { get; set; }
        public int DaysOverdue { get; set; }
        
        public TuitionStatus Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        
        // Chi tiết các môn học trong học kỳ
        public List<TuitionFeeDetailDebt> CourseDetails { get; set; } = new();
        
        // Thông tin thanh toán
        public List<PaymentInfo> Payments { get; set; } = new();
    }

    public class TuitionFeeDetailDebt
    {
        public int DetailId { get; set; }
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty; // Mã lớp học phần
        public string CourseName { get; set; } = string.Empty; // Nội dung phí
        public int Credits { get; set; } // Số tín chỉ
        public decimal UnitPrice { get; set; } // Mức phí
        public decimal Amount { get; set; } // Mức nộp
        public string Description { get; set; } = string.Empty;
        
        // Trạng thái đăng ký của học phần này
        public string EnrollmentStatus { get; set; } = string.Empty;
        public DateTime RegisteredAt { get; set; } // Ngày nộp (đăng ký)
    }

    public class PaymentInfo
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? Note { get; set; }
    }
}