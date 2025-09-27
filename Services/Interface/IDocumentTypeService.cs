using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;

namespace StudentManagement.Services.Interface
{
    public interface IDocumentTypeService
    {
        Task<DocumentType?> GetDocumentTypeByIdAsync(int id);
        Task<IEnumerable<DocumentType>> GetAllDocumentTypesAsync();
        Task<DocumentType> CreateDocumentTypeAsync(DocumentTypeRequest request);
        Task<DocumentType?> UpdateDocumentTypeAsync(int id, DocumentTypeRequest request);
        Task<bool> DeleteDocumentTypeAsync(int id);
    }
}