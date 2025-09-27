using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Enum;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Services
{
    public class DocumentRequestService(AppDbContext context) : IDocumentRequestService
    {
        public async Task<DocumentRequest> CreateDocumentRequestAsync(DocumentRequestRequest request)
        {
            var student = await context.Students.FindAsync(request.StudentId)
                ?? throw new Exception("Student not found");

            var documentType = await context.DocumentTypes.FindAsync(request.DocumentTypeId)
                ?? throw new Exception("Document type not found");  

            var documentRequest = new DocumentRequest
            {
                Student = student,
                DocumentType = documentType,
                RequestDate = DateTime.Now,
                Status = request.Status
            };

            context.DocumentRequests.Add(documentRequest);
            await context.SaveChangesAsync();
            return documentRequest;
        }

        public async Task<bool> DeleteDocumentRequestAsync(int id)
        {
            var documentRequest = await context.DocumentRequests.FindAsync(id);
            if (documentRequest is null)
            {
                return false;
            }

            context.DocumentRequests.Remove(documentRequest);
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<DocumentRequest>> GetAllDocumentRequestsAsync()
        {
            return await context.DocumentRequests
                .Include(dr => dr.Student)
                    .ThenInclude(s => s.User)
                .Include(dr => dr.DocumentType)
                .ToListAsync();
        }

        public async Task<DocumentRequest?> GetDocumentRequestByIdAsync(int id)
        {
            return await context.DocumentRequests
                .Include(dr => dr.Student)
                    .ThenInclude(s => s.User)
                .Include(dr => dr.DocumentType)
                .FirstOrDefaultAsync(dr => dr.DocumentRequestId == id);
        }

        public async Task<IEnumerable<DocumentRequest>> GetDocumentRequestsByStatusAsync(DocRequestStatus status)
        {
            return await context.DocumentRequests
                .Include(dr => dr.Student)
                    .ThenInclude(s => s.User)
                .Include(dr => dr.DocumentType)
                .Where(dr => dr.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<DocumentRequest>> GetDocumentRequestsByStudentAsync(int studentId)
        {
            return await context.DocumentRequests
                .Include(dr => dr.Student)
                .Include(dr => dr.DocumentType)
                .Where(dr => dr.Student.Id == studentId)
                .ToListAsync();
        }

        public async Task<DocumentRequest?> UpdateDocumentRequestStatusAsync(int id, DocRequestStatus status)
        {
            var documentRequest = await context.DocumentRequests.FindAsync(id);
            if (documentRequest is null)
            {
                return null;
            }

            documentRequest.Status = status;

            context.DocumentRequests.Update(documentRequest);
            await context.SaveChangesAsync();
            return documentRequest;
        }
    }
}