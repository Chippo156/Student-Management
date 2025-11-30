using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Models.Dto.Request
{
    public class RegistrationPeriodRequest
    {
        [Required(ErrorMessage = "Semester ID is required")]
        public int SemesterId { get; set; }

        [Required(ErrorMessage = "Department ID is required")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }
    }

    public class UpdateRegistrationPeriodRequest
    {
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }
    }
}