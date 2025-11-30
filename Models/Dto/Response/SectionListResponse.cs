using StudentManagement.Enum;

namespace StudentManagement.Models.Dto.Response
{
    public class SectionListResponse
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public SectionStatus Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        
        // Course information
        public int CourseId { get; set; }
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditsTheory { get; set; }
        public int CreditsLab { get; set; }
        public int TotalCredits { get; set; }
        
        // Lecturer information
        public int? LecturerId { get; set; }
        public string LecturerName { get; set; } = string.Empty;
        public string LecturerEmail { get; set; } = string.Empty;
        
        // Class information
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        
        // Semester information
        public int SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        
        // Section details
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int Capacity { get; set; }
        public int EnrolledCount { get; set; }
        public int AvailableSlots { get; set; }
        public decimal EnrollmentPercentage { get; set; }
        
        // Department information
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        
        // Schedule summary
        public string ScheduleSummary { get; set; } = string.Empty;
        public string RoomSummary { get; set; } = string.Empty;
        
        // Practice groups info
        public int PracticeGroupCount { get; set; }
        public bool HasPracticeGroups { get; set; }
        
        // Creation info
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}