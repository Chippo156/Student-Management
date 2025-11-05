using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcademicProgramController(IAcademicProgramService programService, IStudentService studentService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllPrograms()
        {
            var programs = await programService.GetAllProgramsAsync();
            return Ok(ApiResponse.SuccessResponse(programs, "Academic programs retrieved successfully"));
        }
        [HttpGet("GetAllProgram")]
        public async Task<IActionResult> GetProgramsWithPagination(
          [FromQuery] PaginationParams pagination,
          [FromQuery] string? programName = null,
          [FromQuery] int? departmentId = null,
          [FromQuery] string? degreeLevel = null)
        {
            try
            {
                var result = await programService.GetAllProgramsWithPaginationAsync(
                    pagination, programName, departmentId, degreeLevel);

                return Ok(ApiResponse.SuccessResponse(result, "Academic programs retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving academic programs", new List<string> { ex.Message }));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProgramById(int id)
        {
            var program = await programService.GetProgramByIdAsync(id);
            if (program is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Academic program with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(program, "Academic program retrieved successfully"));
        }

        [HttpGet("department/{departmentId}")]
        public async Task<IActionResult> GetProgramsByDepartment(int departmentId)
        {
            var programs = await programService.GetProgramsByDepartmentAsync(departmentId);
            return Ok(ApiResponse.SuccessResponse(programs, "Department programs retrieved successfully"));
        }

        [HttpPost("CreateProgram")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProgram([FromBody] AcademicProgramRequest request)
        {
            var program = await programService.CreateProgramAsync(request);
            return CreatedAtAction(nameof(GetProgramById), new { id = program.AcademicProgramId }, 
                ApiResponse.SuccessResponse(program, "Academic program created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProgram(int id, [FromBody] AcademicProgramRequest request)
        {
            var program = await programService.UpdateProgramAsync(id, request);
            if (program is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Academic program with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(program, "Academic program updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProgram(int id)
        {
            var result = await programService.DeleteProgramAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Academic program with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Academic program deleted successfully"));
        }

        [HttpGet("GetMyProgramCurriculum")]
        [Authorize]
        public async Task<IActionResult> GetMyProgramCurriculum()
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }

            try
            {
                // Get student's program ID
                var student = await studentService.GetStudentByMSSV(UserNameStr);
                if (student == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Student not found.", null));
                }

                var curriculum = await programService.GetProgramCurriculumAsync(student.ProgramId);
                return Ok(ApiResponse.SuccessResponse(curriculum, "Your program curriculum retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}