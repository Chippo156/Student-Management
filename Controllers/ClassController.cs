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
        [HttpGet("GetAllClasses")]
        public async Task<ActionResult<IEnumerable<Class>>> GetAllClasses()
        {
            var classes = await classService.GetAllClassesAsync();
            return Ok(ApiResponse.SuccessResponse(classes, "Classes retrieved successfully"));
        }

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
    }
}