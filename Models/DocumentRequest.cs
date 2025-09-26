using StudentManagement.Enum;

namespace StudentManagement.Models
{
    public class DocumentRequest
    {
        public int DocumentRequestId { get; set; }
        public Student Student { get; set; } = null!;
        public DocumentType DocumentType { get; set; } = null!;
        public DateTime RequestDate { get; set; }
        public DocRequestStatus Status { get; set; } = DocRequestStatus.Pending;
    }
}
