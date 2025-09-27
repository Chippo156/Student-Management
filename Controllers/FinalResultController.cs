using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinalResultController(IFinalResultService finalResultService) : ControllerBase
    {
        [HttpGet("GetAllFinalResults")]
        public async Task<ActionResult<IEnumerable<FinalResult>>> GetAllFinalResults()
        {
            var finalResults = await finalResultService.GetAllFinalResultsAsync();
            return Ok(ApiResponse.SuccessResponse(finalResults, "Final results retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FinalResult>> GetFinalResultById(int id)
        {
            var finalResult = await finalResultService.GetFinalResultByIdAsync(id);
            if (finalResult is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Final result with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(finalResult, "Final result retrieved successfully"));
        }

        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<FinalResult>>> GetFinalResultsByStudent(int studentId)
        {
            var finalResults = await finalResultService.GetFinalResultsByStudentAsync(studentId);
            return Ok(ApiResponse.SuccessResponse(finalResults, "Student final results retrieved successfully"));
        }

        [HttpGet("section/{sectionId}")]
        public async Task<ActionResult<IEnumerable<FinalResult>>> GetFinalResultsBySection(int sectionId)
        {
            var finalResults = await finalResultService.GetFinalResultsBySectionAsync(sectionId);
            return Ok(ApiResponse.SuccessResponse(finalResults, "Section final results retrieved successfully"));
        }

        [HttpPost("CreateFinalResult")]
        public async Task<ActionResult<FinalResult>> CreateFinalResult(FinalResultRequest request)
        {
            var createdFinalResult = await finalResultService.CreateFinalResultAsync(request);
            return CreatedAtAction(nameof(GetFinalResultById), new { id = createdFinalResult.FinalResultId }, ApiResponse.SuccessResponse(createdFinalResult, "Final result created successfully"));
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<FinalResult>> UpdateFinalResult(int id, FinalResultRequest request)
        {
            var updatedFinalResult = await finalResultService.UpdateFinalResultAsync(id, request);
            if (updatedFinalResult is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Final result with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedFinalResult, "Final result updated successfully"));
        }

        [HttpDelete("DeleteFinalResult/{id}")]
        public async Task<ActionResult> DeleteFinalResult(int id)
        {
            var isDeleted = await finalResultService.DeleteFinalResultAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Final result with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Final result deleted successfully"));
        }
    }
}