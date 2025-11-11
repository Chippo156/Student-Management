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
    public class ClassController(IClassService classService) : ControllerBase
    {


        [HttpGet("{id}")]
        public async Task<ActionResult<Class>> GetClassById(int id)
        {
            var classEntity = await classService.GetClassByIdAsync(id);
            if (classEntity is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Class with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(classEntity, "Class retrieved successfully"));
        }

        [HttpPost("CreateClass")]
        public async Task<ActionResult<Class>> CreateClass(ClassRequest classRequest)
        {
            var createdClass = await classService.CreateClassAsync(classRequest);
            if (createdClass is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Failed to create class.", null));
            }
            return CreatedAtAction(nameof(GetClassById), new { id = createdClass.ClassId }, ApiResponse.SuccessResponse(createdClass, "Class created successfully"));
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<Class>> UpdateClass(int id, string className)
        {
            var updatedClass = await classService.UpdateClassAsync(id, className);
            if (updatedClass is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Class with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedClass, "Class updated successfully"));
        }

        [HttpDelete("DeleteClass/{id}")]
        public async Task<ActionResult> DeleteClass(int id)
        {
            var isDeleted = await classService.DeleteClassAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Class with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Class deleted successfully"));
        }

        [HttpGet("dropdown")]
        public async Task<IActionResult> GetClassesDropdown()
        {
            try
            {
                var classes = await classService.GetClassesDropdownAsync();
                return Ok(ApiResponse.SuccessResponse(classes, "Classes dropdown retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while retrieving classes dropdown", new List<string> { ex.Message }));
            }
        }

        [HttpGet("dropdown/program/{programId}")]
        public async Task<IActionResult> GetClassesByProgramDropdown(int programId)
        {
            try
            {
                var classes = await classService.GetClassesByProgramDropdownAsync(programId);
                return Ok(ApiResponse.SuccessResponse(classes, "Classes by program dropdown retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while retrieving classes by program dropdown", new List<string> { ex.Message }));
            }
        }

        [HttpGet("dropdown/department/{departmentId}")]
        public async Task<IActionResult> GetClassesByDepartmentDropdown(int departmentId)
        {
            try
            {
                var classes = await classService.GetClassesByDepartmentDropdownAsync(departmentId);
                return Ok(ApiResponse.SuccessResponse(classes, "Classes by department dropdown retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, "An error occurred while retrieving classes by department dropdown", new List<string> { ex.Message }));
            }
        }

        [HttpGet("GetAllClasses")]
        public async Task<IActionResult> GetClassesWithPagination(
            [FromQuery] PaginationParams pagination,
            [FromQuery] string? search = null,
            [FromQuery] int? programId = null)
        {
            try
            {
                var result = await classService.GetClassesWithPaginationAsync(pagination, search, programId);
                return Ok(ApiResponse.SuccessResponse(result, "Classes retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while retrieving classes", new List<string> { ex.Message }));
            }
        }
    }
}