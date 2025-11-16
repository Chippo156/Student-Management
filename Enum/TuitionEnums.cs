namespace StudentManagement.Enum
{
    public enum TuitionStatus
    {
        Pending = 1,        // Chưa đóng
        PartialPaid = 2,    // Đóng một phần
        FullyPaid = 3,      // Đã đóng đủ
        Overdue = 4,        // Quá hạn
        Waived = 5,         // Được miễn giảm
        Cancelled = 6       // Hủy bỏ
    }
    
    public enum PaymentMethod
    {
        Cash = 1,           // Tiền mặt
        BankTransfer = 2,   // Chuyển khoản
        CreditCard = 3,     // Thẻ tín dụng
        OnlinePayment = 4,  // Thanh toán online
        ScholarShip = 5     // Học bổng
    }
    
    public enum PaymentStatus
    {
        Pending = 1,        // Đang chờ xử lý
        Completed = 2,      // Hoàn thành
        Failed = 3,         // Thất bại
        Cancelled = 4,      // Hủy bỏ
        Refunded = 5        // Hoàn tiền
    }
    
    public enum TuitionFeeType
    {
        Regular = 1,        // Học phí thường
        Makeup = 2,         // Học phí học lại
        Improvement = 3,    // Học phí học cải thiện điểm
        Laboratory = 4,     // Phí thí nghiệm
        Activity = 5,       // Phí hoạt động
        Other = 6          // Phí khác
    }
}