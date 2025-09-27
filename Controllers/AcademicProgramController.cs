using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcademicProgramController(IAcademicProgramService programService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllPrograms()
        {
            var programs = await programService.GetAllProgramsAsync();
            return Ok(ApiResponse.SuccessResponse(programs, "Academic programs retrieved successfully"));
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

        [HttpPost]
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
    }
}