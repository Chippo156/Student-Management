using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IDocumentRequestService
    {
        Task<DocumentRequest?> GetDocumentRequestByIdAsync(int id);
        Task<IEnumerable<DocumentRequest>> GetAllDocumentRequestsAsync();
        Task<IEnumerable<DocumentRequest>> GetDocumentRequestsByStudentAsync(int studentId);
        Task<IEnumerable<DocumentRequest>> GetDocumentRequestsByStatusAsync(DocRequestStatus status);
        Task<DocumentRequest> CreateDocumentRequestAsync(DocumentRequestRequest request);
        Task<DocumentRequest?> UpdateDocumentRequestStatusAsync(int id, DocRequestStatus status);
        Task<bool> DeleteDocumentRequestAsync(int id);
    }
}