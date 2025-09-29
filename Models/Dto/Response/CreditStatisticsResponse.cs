namespace StudentManagement.Models.Dto.Response
{
    public class CreditStatisticsResponse
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string MSSV { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ProgramName { get; set; } = string.Empty;
        public int TotalCreditsRegistered { get; set; }
        public int TotalCreditsCompleted { get; set; }
        public int TotalCreditsPassed { get; set; }
        public double GPA { get; set; }
        public List<SemesterCreditDetail> SemesterCredits { get; set; } = new();
    }

    public class SemesterCreditDetail
    {
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        public int CreditsRegistered { get; set; }
        public int CreditsCompleted { get; set; }
        public int CreditsPassed { get; set; }
        public double SemesterGPA { get; set; }
        public List<CourseDetail> Courses { get; set; } = new();
    }

    public class CourseDetail
    {
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public int TotalCredits => CreditsTheory + CreditsLab;
        public string GradeLetter { get; set; } = string.Empty;
        public double GradePoint { get; set; }
        public double ClassAverageScore { get; set; } // Điểm trung bình lớp học phần

    }
}