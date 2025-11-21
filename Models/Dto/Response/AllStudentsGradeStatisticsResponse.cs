namespace StudentManagement.Models.Dto.Response
{
    public class AllStudentsGradeStatisticsResponse
    {
        public OverallGradeStats OverallStats { get; set; } = new();
        public List<GradeLetterDistribution> GradeDistribution { get; set; } = new();
        public List<DepartmentGradeStat> DepartmentStats { get; set; } = new();
        public List<ProgramGradeStat> ProgramStats { get; set; } = new();
        public List<SemesterOverallStat> SemesterStats { get; set; } = new();
        public GradeRankingInfo Rankings { get; set; } = new();
    }

    public class OverallGradeStats
    {
        public int TotalStudents { get; set; }
        public int StudentsWithGrades { get; set; }
        public double SystemWideGPA { get; set; }
        public double AverageScore { get; set; }
        public double OverallPassingRate { get; set; }
        
        public int TotalSubjects { get; set; }
        public int TotalPassedSubjects { get; set; }
        public int TotalFailedSubjects { get; set; }
    }

    public class GradeLetterDistribution
    {
        public string GradeLetter { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class DepartmentGradeStat
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int StudentsCount { get; set; }
        public double AverageGPA { get; set; }
        public double PassingRate { get; set; }
        public int TotalSubjects { get; set; }
    }

    public class ProgramGradeStat
    {
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public int StudentsCount { get; set; }
        public double AverageGPA { get; set; }
        public double PassingRate { get; set; }
    }

    public class SemesterOverallStat
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int StudentsCount { get; set; }
        public double AverageGPA { get; set; }
        public double PassingRate { get; set; }
        public int TotalSubjects { get; set; }
    }

    public class GradeRankingInfo
    {
        public List<TopStudentInfo> TopStudents { get; set; } = new();
        public List<TopClassInfo> TopClasses { get; set; } = new();
        public List<TopProgramInfo> TopPrograms { get; set; } = new();
    }

    public class TopStudentInfo
    {
        public string MSSV { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public double GPA { get; set; }
        public int Rank { get; set; }
    }

    public class TopClassInfo
    {
        public string ClassName { get; set; } = string.Empty;
        public string ProgramName { get; set; } = string.Empty;
        public double AverageGPA { get; set; }
        public double PassingRate { get; set; }
        public int StudentsCount { get; set; }
    }

    public class TopProgramInfo
    {
        public string ProgramName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public double AverageGPA { get; set; }
        public double PassingRate { get; set; }
        public int StudentsCount { get; set; }
    }
}