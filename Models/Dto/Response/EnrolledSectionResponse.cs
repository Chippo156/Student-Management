using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class EnrolledSectionResponse
    {
        public int SectionId { get; set; } 
        public string SectionCode { get; set; } = string.Empty; // Mã LHP
        public string CourseName { get; set; } = string.Empty; // Tên môn học
        public string ExpectedClass { get; set; } = string.Empty; // Lớp học dự kiến
        public int Credits { get; set; } // Số TC
        public string LabGroup { get; set; } = string.Empty; // Nhóm TH
        public decimal TuitionFee { get; set; } // Học phí
        public DateTime PaymentDeadline { get; set; } // Hạn nộp
        public string DayOfWeek { get; set; } = string.Empty; // Thứ
        public DateOnly StartDate { get; set; } // Ngày bắt đầu
        public DateOnly EndDate { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty; // Trạng thái ĐK
        public DateTime RegistrationDate { get; set; } // Ngày ĐK
        public string SectionStatus { get; set; } = string.Empty; // Trạng thái LHP
        
        // Additional information
        public string LecturerName { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string TimeSlot { get; set; } = string.Empty;
        public int CurrentEnrollment { get; set; }
        public int MaxCapacity { get; set; }
        public string SemesterName { get; set; } = string.Empty;
    }
}