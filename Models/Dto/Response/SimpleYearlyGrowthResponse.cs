namespace StudentManagement.Models.Dto.Response
{
    public class SimpleYearlyGrowthResponse
    {
        public int Years { get; set; }
        public List<SimpleYearlyData> Data { get; set; } = new();
        public int TotalStudents { get; set; }
        public int TotalLecturers { get; set; }
    }

    public class SimpleYearlyData
    {
        public int Year { get; set; }
        public int StudentCount { get; set; }
        public int LecturerCount { get; set; }
    }
}