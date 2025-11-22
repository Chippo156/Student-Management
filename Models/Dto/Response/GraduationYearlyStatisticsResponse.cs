namespace StudentManagement.Models.Dto.Response
{
    public class GraduationYearlyStatisticsResponse
    {
        public List<YearlyGraduationStat> YearlyStats { get; set; } = new();
    }

    public class YearlyGraduationStat
    {
        public int Year { get; set; } // Năm ra trường dự kiến
        public int OnTimeGraduates { get; set; } // Số sinh viên ra trường đúng hạn
        public int LateGraduates { get; set; } // Số sinh viên ra trường trễ hạn
    }
}