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
    public class CourseController(ICourseService courseService) : ControllerBase
    {
        [HttpGet("GetAllCourses")]
        public async Task<ActionResult<IEnumerable<Course>>> GetAllCourses()
        {
            var courses = await courseService.GetAllCoursesAsync();
            return Ok(ApiResponse.SuccessResponse(courses, "Courses retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourseById(int id)
        {
            var course = await courseService.GetCourseByIdAsync(id);
            if (course is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Course with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(course, "Course retrieved successfully"));
        }

        [HttpPost("CreateCourse")]
        public async Task<ActionResult<Course>> CreateCourse(CourseRequest courseRequest)
        {
            var createdCourse = await courseService.CreateCourseAsync(courseRequest);
            if (createdCourse is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Failed to create course.", null));
            }
            return CreatedAtAction(nameof(GetCourseById), new { id = createdCourse.CourseId }, ApiResponse.SuccessResponse(createdCourse, "Course created successfully"));
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<Course>> UpdateCourse(int id, CourseRequest courseRequest)
        {
            var updatedCourse = await courseService.UpdateCourseAsync(id, courseRequest);
            if (updatedCourse is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Course with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedCourse, "Course updated successfully"));
        }

        [HttpDelete("DeleteCourse/{id}")]
        public async Task<ActionResult> DeleteCourse(int id)
        {
            var isDeleted = await courseService.DeleteCourseAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Course with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Course deleted successfully"));
        }

        [HttpGet("GetCoursesWithPrograms")]
        public async Task<IActionResult> GetCoursesWithPrograms(
            [FromQuery] PaginationParams pagination,
            [FromQuery] string? search = null,
            [FromQuery] int? courseType = null)
        {
            try
            {
                var result = await courseService.GetCoursesWithProgramsAsync(pagination, search, courseType);
                return Ok(ApiResponse.SuccessResponse(result, "Courses with programs retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while retrieving courses", new List<string> { ex.Message }));
            }
        }
    }
}