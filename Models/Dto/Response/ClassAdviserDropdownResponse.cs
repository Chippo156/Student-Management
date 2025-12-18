namespace StudentManagement.Models.Dto.Response
{
    public class ClassAdviserDropdownResponse
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = "";
        public string ClassCode { get; set; } = "";
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = "";
        public string DepartmentName { get; set; } = "";
        public int StudentCount { get; set; } // Số sinh viên trong lớp
        public DateTime AssignedDate { get; set; } // Ngày được phân công
        public string AssignmentStatus { get; set; } = ""; // Trạng thái phân công
    }
}