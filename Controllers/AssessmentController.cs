using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssessmentController(IAssessmentService assessmentService) : ControllerBase
    {
        [HttpGet("GetAllAssessments")]
        public async Task<ActionResult<IEnumerable<Assessment>>> GetAllAssessments()
        {
            var assessments = await assessmentService.GetAllAssessmentsAsync();
            return Ok(ApiResponse.SuccessResponse(assessments, "Assessments retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Assessment>> GetAssessmentById(int id)
        {
            var assessment = await assessmentService.GetAssessmentByIdAsync(id);
            if (assessment is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Assessment with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(assessment, "Assessment retrieved successfully"));
        }

        [HttpGet("section/{sectionId}")]
        public async Task<ActionResult<IEnumerable<Assessment>>> GetAssessmentsBySection(int sectionId)
        {
            var assessments = await assessmentService.GetAssessmentsBySectionAsync(sectionId);
            return Ok(ApiResponse.SuccessResponse(assessments, "Section assessments retrieved successfully"));
        }

        [HttpPost("CreateAssessment")]
        public async Task<ActionResult<Assessment>> CreateAssessment(AssessmentRequest request)
        {
            var createdAssessment = await assessmentService.CreateAssessmentAsync(request);
            return CreatedAtAction(nameof(GetAssessmentById), new { id = createdAssessment.AssessmentId }, ApiResponse.SuccessResponse(createdAssessment, "Assessment created successfully"));
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<Assessment>> UpdateAssessment(int id, AssessmentRequest request)
        {
            var updatedAssessment = await assessmentService.UpdateAssessmentAsync(id, request);
            if (updatedAssessment is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Assessment with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedAssessment, "Assessment updated successfully"));
        }

        [HttpDelete("DeleteAssessment/{id}")]
        public async Task<ActionResult> DeleteAssessment(int id)
        {
            var isDeleted = await assessmentService.DeleteAssessmentAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Assessment with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Assessment deleted successfully"));
        }
    }
}