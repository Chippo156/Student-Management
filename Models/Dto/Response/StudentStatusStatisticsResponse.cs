namespace StudentManagement.Models.Dto.Response
{
    public class StudentStatusStatisticsResponse
    {
        public int ActiveStudents { get; set; }      // Đang học
        public int InactiveStudents { get; set; }    // Tạm nghỉ
        public int GraduatedStudents { get; set; }   // Đã tốt nghiệp
        public int SuspendedStudents { get; set; }   // Bị đình chỉ
        public int ReservedStudents { get; set; }    // Bảo lưu
        public int TotalStudents { get; set; }       // Tổng số
    }
}