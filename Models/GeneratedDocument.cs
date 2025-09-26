namespace StudentManagement.Models
{
    public class GeneratedDocument
    {
        public int Id { get; set; }
        public DocumentRequest DocumentRequest{ get; set; } = null!;
        public String FilePath { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

    }
}
