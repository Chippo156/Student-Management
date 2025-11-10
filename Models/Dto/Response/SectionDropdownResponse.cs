namespace StudentManagement.Models.Dto.Response
{
    public class SectionDropdownResponse
    {
        public int SectionId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
    }
}