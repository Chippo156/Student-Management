using Microsoft.AspNetCore.Mvc;
using StudentManagement.Enum;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentRequestController(IDocumentRequestService documentRequestService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllDocumentRequests()
        {
            var documentRequests = await documentRequestService.GetAllDocumentRequestsAsync();
            return Ok(ApiResponse.SuccessResponse(documentRequests, "Document requests retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentRequestById(int id)
        {
            var documentRequest = await documentRequestService.GetDocumentRequestByIdAsync(id);
            if (documentRequest is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Document request with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(documentRequest, "Document request retrieved successfully"));
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetDocumentRequestsByStudent(int studentId)
        {
            var documentRequests = await documentRequestService.GetDocumentRequestsByStudentAsync(studentId);
            return Ok(ApiResponse.SuccessResponse(documentRequests, "Student document requests retrieved successfully"));
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetDocumentRequestsByStatus(DocRequestStatus status)
        {
            var documentRequests = await documentRequestService.GetDocumentRequestsByStatusAsync(status);
            return Ok(ApiResponse.SuccessResponse(documentRequests, "Document requests by status retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateDocumentRequest([FromBody] DocumentRequestRequest request)
        {
            var documentRequest = await documentRequestService.CreateDocumentRequestAsync(request);
            return CreatedAtAction(nameof(GetDocumentRequestById), new { id = documentRequest.DocumentRequestId },
                ApiResponse.SuccessResponse(documentRequest, "Document request created successfully"));
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateDocumentRequestStatus(int id, [FromBody] DocRequestStatus status)
        {
            var documentRequest = await documentRequestService.UpdateDocumentRequestStatusAsync(id, status);
            if (documentRequest is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Document request with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(documentRequest, "Document request status updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocumentRequest(int id)
        {
            var result = await documentRequestService.DeleteDocumentRequestAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Document request with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Document request deleted successfully"));
        }
    }
}