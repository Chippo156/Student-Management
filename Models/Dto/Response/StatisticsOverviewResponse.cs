namespace StudentManagement.Models.Dto.Response
{
    public class StatisticsOverviewResponse
    {
        public int TotalStudents { get; set; } // Tổng số sinh viên
        public int TotalLecturers { get; set; } // Tổng số giảng viên
        public int TotalCourses { get; set; } // Tổng số môn học
        public double PassingRate { get; set; } // Tỷ lệ sinh viên qua môn (%)
    }
}