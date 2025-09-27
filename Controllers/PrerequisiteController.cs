using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrerequisiteController(IPrerequisiteService prerequisiteService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllPrerequisites()
        {
            var prerequisites = await prerequisiteService.GetAllPrerequisitesAsync();
            return Ok(ApiResponse.SuccessResponse(prerequisites, "Prerequisites retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPrerequisiteById(int id)
        {
            var prerequisite = await prerequisiteService.GetPrerequisiteByIdAsync(id);
            if (prerequisite is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Prerequisite with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(prerequisite, "Prerequisite retrieved successfully"));
        }

        [HttpGet("course/{courseId}/prerequisites")]
        public async Task<IActionResult> GetPrerequisitesForCourse(int courseId)
        {
            var courses = await prerequisiteService.GetPrerequisiteCoursesForCourseAsync(courseId);
            return Ok(ApiResponse.SuccessResponse(courses, "Course prerequisites retrieved successfully"));
        }

        [HttpGet("course/{courseId}/requiring")]
        public async Task<IActionResult> GetCoursesRequiringPrerequisite(int courseId)
        {
            var courses = await prerequisiteService.GetCoursesRequiringPrerequisiteAsync(courseId);
            return Ok(ApiResponse.SuccessResponse(courses, "Courses requiring this prerequisite retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreatePrerequisite([FromBody] PrerequisiteRequest request)
        {
            try {
                var prerequisite = await prerequisiteService.CreatePrerequisiteAsync(request);
                return CreatedAtAction(nameof(GetPrerequisiteById), new { id = prerequisite.Id },
                    ApiResponse.SuccessResponse(prerequisite, "Prerequisite created successfully"));
            }
            catch (Exception ex) {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrerequisite(int id)
        {
            var result = await prerequisiteService.DeletePrerequisiteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Prerequisite with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Prerequisite deleted successfully"));
        }
    }
}