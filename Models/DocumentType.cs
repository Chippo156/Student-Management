namespace StudentManagement.Models
{
    public class DocumentType
    {
        public int DocumentTypeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string TemplatePath { get; set; } = string.Empty;
    }
}
