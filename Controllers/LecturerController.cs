using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Enum;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController(ILecturerService lecturerService) : ControllerBase
    {
        [HttpGet("GetAllLecturers")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResult<Lecturer>>> GetAllLecturers(
            [FromQuery] PaginationParams pagination,
            [FromQuery] string? search = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] string? position = null,
            [FromQuery] string? academicTitle = null,
            [FromQuery] LecturerStatus? lecturerStatus = null)
        {
            try
            {
                var result = await lecturerService.GetAllLecturersAsync(
                    pagination, 
                    search, 
                    departmentId, 
                    position, 
                    academicTitle,
                    lecturerStatus);
                    
                return Ok(ApiResponse.SuccessResponse(result, "Lecturers retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving lecturers", new List<string> { ex.Message }));
            }
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
        [HttpGet("GetLecturerDropdownByDepartmentId")] 
        public async Task<ActionResult<IEnumerable<LecturerDropdownResponse>>> GetLecturersByDepartmentId([FromQuery] int departmentId)
        {
            var lecturers = await lecturerService.GetLecturerDropdownsByDepartmentIdAsync(departmentId);
            return Ok(ApiResponse.SuccessResponse(lecturers, "Lecturers retrieved successfully"));
        }

        [HttpPut("UpdateLecturer")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> UpdateProfile(LecturerUpdateRequest request)
        {
            try
            {
                // Lấy lecturer code từ JWT token
                var lecturerCode = User.FindFirst(ClaimTypes.Name)?.Value;

                if (string.IsNullOrEmpty(lecturerCode))
                {
                    return BadRequest(ApiResponse.ErrorResponse(
                        ErrorCodes.BadRequest,
                        "Không thể xác định thông tin giảng viên từ token"
                    ));
                }

                // Validate model
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(ApiResponse.ErrorResponse(
                        ErrorCodes.ValidationError,
                        "Dữ liệu không hợp lệ",
                        errors
                    ));
                }

                // Cập nhật thông tin
                var updatedLecturer = await lecturerService.UpdateLecturerProfileAsync(lecturerCode, request);

                if (updatedLecturer == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(
                        ErrorCodes.NotFound,
                        "Không tìm thấy thông tin giảng viên"
                    ));
                }

                // Trả về thông tin chi tiết đã cập nhật
                var lecturerDetail = await lecturerService.GetLecturerDetailByCodeAsync(lecturerCode);

                return Ok(ApiResponse.SuccessResponse(
                    lecturerDetail,
                    "Cập nhật thông tin thành công"
                ));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    ErrorCodes.BadRequest,
                    ex.Message
                ));
            }
        }
    }
}
