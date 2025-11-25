namespace StudentManagement.Models.Dto.Response
{
    public class StudentYearDistributionResponse
    {
        public List<YearDistributionStat> YearDistribution { get; set; } = new();
        public int TotalStudents { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    public class YearDistributionStat
    {
        public int YearLevel { get; set; } // 1, 2, 3, 4...
        public string YearName { get; set; } = string.Empty; // "Năm nhất", "Năm hai"...
        public int StudentCount { get; set; }
        public double Percentage { get; set; }
    }
}