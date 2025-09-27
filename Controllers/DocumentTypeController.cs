using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentTypeController(IDocumentTypeService documentTypeService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllDocumentTypes()
        {
            var documentTypes = await documentTypeService.GetAllDocumentTypesAsync();
            return Ok(ApiResponse.SuccessResponse(documentTypes, "Document types retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentTypeById(int id)
        {
            var documentType = await documentTypeService.GetDocumentTypeByIdAsync(id);
            if (documentType is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Document type with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(documentType, "Document type retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateDocumentType([FromBody] DocumentTypeRequest request)
        {
            var documentType = await documentTypeService.CreateDocumentTypeAsync(request);
            return CreatedAtAction(nameof(GetDocumentTypeById), new { id = documentType.DocumentTypeId },
                ApiResponse.SuccessResponse(documentType, "Document type created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocumentType(int id, [FromBody] DocumentTypeRequest request)
        {
            var documentType = await documentTypeService.UpdateDocumentTypeAsync(id, request);
            if (documentType is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Document type with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(documentType, "Document type updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocumentType(int id)
        {
            var result = await documentTypeService.DeleteDocumentTypeAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Document type with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Document type deleted successfully"));
        }
    }
}   