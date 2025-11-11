using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController(ILecturerService lecturerService) : ControllerBase
    {
        [HttpGet("GetAllLecturers")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Lecturer>>> GetAllLecturers([FromQuery] PaginationParams pagination, [FromQuery] string? search)
        {
            var lecturers = await lecturerService.GetAllLecturersAsync(pagination, search);
            return Ok(ApiResponse.SuccessResponse(lecturers, "Lecturers retrieved successfully"));
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Lecturer>> GetLecturerById(int id)
        {
            var lecturer = await lecturerService.GetLecturerByIdAsync(id);
            if (lecturer is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Lecturer with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(lecturer, "Lecturer retrieved successfully"));
        }
        [HttpPost]
        public async Task<ActionResult<Lecturer>> CreateLecturer(LecturerRequest lecturer)
        {
            var createdLecturer = await lecturerService.CreateLecturerAsync(lecturer);
            if (createdLecturer is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Failed to create lecturer.", null));
            }
            return CreatedAtAction(nameof(GetLecturerById), new { id = createdLecturer.Id }, ApiResponse.SuccessResponse(createdLecturer, "Lecturer created successfully"));
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLecturer(int id)
        {
            var isDeleted = await lecturerService.DeleteLecturerAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Lecturer with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Lecturer deleted successfully"));
        }
    }
}
