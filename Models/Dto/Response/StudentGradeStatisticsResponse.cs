namespace StudentManagement.Models.Dto.Response
{
    public class StudentGradeStatisticsResponse
    {
        // Student Information
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ProgramName { get; set; } = string.Empty;

        // Overall Statistics
        public GradeOverallStats OverallStats { get; set; } = new();

        // Statistics by Grade Letter
        public List<GradeLetterStat> GradeDistribution { get; set; } = new();

        // Statistics by Semester
        public List<SemesterGradeStat> SemesterStats { get; set; } = new();

        // Statistics by Subject Type
        public List<SubjectTypeStat> SubjectTypeStats { get; set; } = new();

        // Performance Trends
        public GradePerformanceTrend PerformanceTrend { get; set; } = new();
    }

    public class GradeOverallStats
    {
        public int TotalSubjects { get; set; }
        public int PassedSubjects { get; set; }
        public int FailedSubjects { get; set; }
        public double PassingRate { get; set; } // %
        
        public double AverageScore { get; set; } // Điểm trung bình tổng
        public double CurrentGPA4 { get; set; } // GPA hệ 4
        public double CurrentGPA10 { get; set; } // GPA hệ 10
        
        public double HighestScore { get; set; }
        public double LowestScore { get; set; }
        public string HighestScoreSubject { get; set; } = string.Empty;
        public string LowestScoreSubject { get; set; } = string.Empty;

        public int TotalCreditsRegistered { get; set; }
        public int TotalCreditsEarned { get; set; }
        public int TotalCreditsFailed { get; set; }
    }

    public class GradeLetterStat
    {
        public string GradeLetter { get; set; } = string.Empty; // A, B+, B, C+, C, D+, D, F
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Description { get; set; } = string.Empty; // Xuất sắc, Giỏi, Khá...
    }

    public class SemesterGradeStat
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        
        public int SubjectsCount { get; set; }
        public int PassedCount { get; set; }
        public int FailedCount { get; set; }
        
        public double SemesterGPA4 { get; set; }
        public double SemesterGPA10 { get; set; }
        public double AverageScore { get; set; }
        public double PassingRate { get; set; }
        
        public int CreditsRegistered { get; set; }
        public int CreditsEarned { get; set; }
        
        public string AcademicRank { get; set; } = string.Empty; // Xuất sắc, Giỏi, Khá...
    }

    public class SubjectTypeStat
    {
        public string SubjectType { get; set; } = string.Empty; // Cơ sở, Chuyên ngành, Tự chọn...
        public int SubjectsCount { get; set; }
        public double AverageScore { get; set; }
        public double PassingRate { get; set; }
        public int TotalCredits { get; set; }
    }

    public class GradePerformanceTrend
    {
        public string TrendDirection { get; set; } = string.Empty; // Improving, Declining, Stable
        public string TrendDescription { get; set; } = string.Empty;
        public List<SemesterTrendPoint> TrendPoints { get; set; } = new();
        
        public double GPAChangeFromFirstSemester { get; set; }
        public double GPAChangeFromLastSemester { get; set; }
    }

    public class SemesterTrendPoint
    {
        public string SemesterName { get; set; } = string.Empty;
        public double GPA { get; set; }
        public double AverageScore { get; set; }
    }
}