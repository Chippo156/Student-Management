namespace StudentManagement.Models.Dto.Response
{
    public class DepartmentDropdownResponse
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int FacultyId { get; set; }
        public string FacultyName { get; set; } = string.Empty;
    }

    public class ClassDropdownResponse
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class FacultyDropdownResponse
    {
        public int FacultyId { get; set; }
        public string FacultyName { get; set; } = string.Empty;
    }

    public class ProgramDropdownResponse
    {
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string DegreeLevel { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class CurriculumCourseDropdownResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string ProgramName { get; set; } = string.Empty;
    }

    public class LecturerDropdownResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LecturerCode { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class SemesterDropdownResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Term { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

}