using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class LecturerDetailResponse
    {
        // Basic Lecturer Info
        public int LecturerId { get; set; }
        public string LecturerCode { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string AcademicTitle { get; set; } = string.Empty;
        
        // Department & Faculty Info
        public string DepartmentName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        
        // User Information
        public UserResponse User { get; set; } = null!;
        
        // Teaching Statistics
        public TeachingStatistics Statistics { get; set; } = new();
        
        // Current Sections Teaching
        public List<CurrentSectionInfo> CurrentSections { get; set; } = new();
        
        // Class Advisor Information
        public List<AdvisorClassInfo> AdvisorClasses { get; set; } = new();
    }

    public class TeachingStatistics
    {
        public int TotalSectionsCurrentSemester { get; set; }
        public int TotalStudentsCurrentSemester { get; set; }
        public int TotalSectionsAllTime { get; set; }
        public double AverageClassSize { get; set; }
        public List<SemesterTeachingInfo> SemesterHistory { get; set; } = new();
    }

    public class CurrentSectionInfo
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public int EnrolledCount { get; set; }
        public int Capacity { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public List<ScheduleInfo> Schedules { get; set; } = new();
    }

    public class ScheduleInfo
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public string TimeSlot { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string ScheduleType { get; set; } = string.Empty;
    }

    public class AdvisorClassInfo
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string ProgramName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class SemesterTeachingInfo
    {
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int SectionsCount { get; set; }
        public int StudentsCount { get; set; }
        public double AverageClassSize { get; set; }
    }
}