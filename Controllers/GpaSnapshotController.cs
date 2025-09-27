using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GpaSnapshotController(IGpaSnapshotService gpaSnapshotService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllGpaSnapshots()
        {
            var gpaSnapshots = await gpaSnapshotService.GetAllGpaSnapshotsAsync();
            return Ok(ApiResponse.SuccessResponse(gpaSnapshots, "GPA snapshots retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGpaSnapshotById(int id)
        {
            var gpaSnapshot = await gpaSnapshotService.GetGpaSnapshotByIdAsync(id);
            if (gpaSnapshot is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"GPA snapshot with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(gpaSnapshot, "GPA snapshot retrieved successfully"));
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetGpaSnapshotsByStudent(int studentId)
        {
            var gpaSnapshots = await gpaSnapshotService.GetGpaSnapshotsByStudentAsync(studentId);
            return Ok(ApiResponse.SuccessResponse(gpaSnapshots, "Student GPA snapshots retrieved successfully"));
        }

        [HttpGet("student/{studentId}/latest")]
        public async Task<IActionResult> GetLatestGpaSnapshotByStudent(int studentId)
        {
            var gpaSnapshot = await gpaSnapshotService.GetLatestGpaSnapshotByStudentAsync(studentId);
            if (gpaSnapshot is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"No GPA snapshots found for student with ID {studentId}", null));
            }
            return Ok(ApiResponse.SuccessResponse(gpaSnapshot, "Latest GPA snapshot retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateGpaSnapshot([FromBody] GpaSnapshotRequest request)
        {
            try
            {
                var gpaSnapshot = await gpaSnapshotService.CreateGpaSnapshotAsync(request);
                return CreatedAtAction(nameof(GetGpaSnapshotById), new { id = gpaSnapshot.GpaSnapshotId },
                    ApiResponse.SuccessResponse(gpaSnapshot, "GPA snapshot created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGpaSnapshot(int id, [FromBody] GpaSnapshotRequest request)
        {
            try
            {
                var gpaSnapshot = await gpaSnapshotService.UpdateGpaSnapshotAsync(id, request);
                if (gpaSnapshot is null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"GPA snapshot with ID {id} not found", null));
                }
                return Ok(ApiResponse.SuccessResponse(gpaSnapshot, "GPA snapshot updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGpaSnapshot(int id)
        {
            var result = await gpaSnapshotService.DeleteGpaSnapshotAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"GPA snapshot with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "GPA snapshot deleted successfully"));
        }
    }
}