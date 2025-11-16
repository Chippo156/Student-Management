using StudentManagement.Enum;
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class UpdateSectionRequest
    {
        public int? CurriculumCourseId { get; set; }
        
        public int? LecturerId { get; set; }
        
        public int? SemesterId { get; set; }
        
        public int? ClassId { get; set; }
        
        [DataType(DataType.Date)]
        public DateOnly? StartDate { get; set; }
        
        [DataType(DataType.Date)]
        public DateOnly? EndDate { get; set; }
        
        [Range(1, 200, ErrorMessage = "Capacity must be between 1 and 200")]
        public int? Capacity { get; set; }
        
        public SectionStatus? Status { get; set; }
        
        [Range(0, 200, ErrorMessage = "MinEnrollment must be between 0 and 200")]
        public int? MinEnrollment { get; set; }
        
        [Range(0.0, 1.0, ErrorMessage = "MinEnrollmentPercentage must be between 0 and 1")]
        public double? MinEnrollmentPercentage { get; set; }
    }
}