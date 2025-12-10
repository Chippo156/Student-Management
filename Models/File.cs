namespace StudentManagement.Models
{
    public class File
    {
        public int FileId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public User UploadedBy { get; set; } = null!;
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}
