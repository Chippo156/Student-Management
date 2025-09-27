using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class DocumentTypeService(AppDbContext context) : IDocumentTypeService
    {
        public async Task<DocumentType> CreateDocumentTypeAsync(DocumentTypeRequest request)
        {
            var documentType = new DocumentType
            {
                Name = request.Name,
                TemplatePath = request.TemplatePath
            };

            context.DocumentTypes.Add(documentType);
            await context.SaveChangesAsync();
            return documentType;
        }

        public async Task<bool> DeleteDocumentTypeAsync(int id)
        {
            var documentType = await context.DocumentTypes.FindAsync(id);
            if (documentType is null)
            {
                return false;
            }

            context.DocumentTypes.Remove(documentType);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<DocumentType>> GetAllDocumentTypesAsync()
        {
            return await context.DocumentTypes.ToListAsync();
        }

        public async Task<DocumentType?> GetDocumentTypeByIdAsync(int id)
        {
            return await context.DocumentTypes.FindAsync(id);
        }

        public async Task<DocumentType?> UpdateDocumentTypeAsync(int id, DocumentTypeRequest request)
        {
            var documentType = await context.DocumentTypes.FindAsync(id);
            if (documentType is null)
            {
                return null;
            }

            documentType.Name = request.Name;
            documentType.TemplatePath = request.TemplatePath;

            context.DocumentTypes.Update(documentType);
            await context.SaveChangesAsync();
            return documentType;
        }
    }
}