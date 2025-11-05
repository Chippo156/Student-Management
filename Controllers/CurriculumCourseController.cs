using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using StudentManagement.Enum;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurriculumCourseController(ICurriculumCourseService curriculumCourseService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllCurriculumCourses()
        {
            var courses = await curriculumCourseService.GetAllCurriculumCoursesAsync();
            return Ok(ApiResponse.SuccessResponse(courses, "Curriculum courses retrieved successfully"));
        }

        [HttpGet("GetAllCurriculumCourse")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCurriculumCoursesWithPagination(
          [FromQuery] PaginationParams pagination,
          [FromQuery] string? courseCode = null,
          [FromQuery] string? courseName = null,
          [FromQuery] int? programId = null,
          [FromQuery] int? departmentId = null)
        {
            try
            {
                var result = await curriculumCourseService.GetAllCurriculumCoursesWithPaginationAsync(
                    pagination, courseCode, courseName, programId, departmentId);

                return Ok(ApiResponse.SuccessResponse(result, "Curriculum courses retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving curriculum courses", new List<string> { ex.Message }));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCurriculumCourseById(int id)
        {
            var course = await curriculumCourseService.GetCurriculumCourseByIdAsync(id);
            if (course is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Curriculum course with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(course, "Curriculum course retrieved successfully"));
        }

        [HttpGet("program/{programId}")]
        public async Task<IActionResult> GetCurriculumCoursesByProgram(int programId)
        {
            var courses = await curriculumCourseService.GetCurriculumCoursesByProgramAsync(programId);
            return Ok(ApiResponse.SuccessResponse(courses, "Program curriculum courses retrieved successfully"));
        }

        [HttpGet("program/{programId}/semester/{semester}")]
        public async Task<IActionResult> GetCurriculumCoursesBySemester(int programId, int semester)
        {
            var courses = await curriculumCourseService.GetCurriculumCoursesBySemesterAsync(programId, semester);
            return Ok(ApiResponse.SuccessResponse(courses, "Semester curriculum courses retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateCurriculumCourse([FromBody] CurriculumCourseRequest request)
        {
            var course = await curriculumCourseService.CreateCurriculumCourseAsync(request);
            return CreatedAtAction(nameof(GetCurriculumCourseById), new { id = course.Id },
                ApiResponse.SuccessResponse(course, "Curriculum course created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCurriculumCourse(int id, [FromBody] CurriculumCourseRequest request)
        {
            var course = await curriculumCourseService.UpdateCurriculumCourseAsync(id, request);
            if (course is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Curriculum course with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(course, "Curriculum course updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCurriculumCourse(int id)
        {
            var result = await curriculumCourseService.DeleteCurriculumCourseAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Curriculum course with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Curriculum course deleted successfully"));
        }

        [HttpGet("GetCoursesByStudentDepartment")]
        [Authorize]
        public async Task<IActionResult> GetCoursesByMyDepartment(
            [FromQuery] int? semesterId = null, 
            [FromQuery] CourseFilterType? filterType = null)
            {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }

            try
            {
                var courses = await curriculumCourseService.GetCoursesByStudentDepartmentAsync(UserNameStr, semesterId, filterType);
                
                return Ok(ApiResponse.SuccessResponse(courses, "Department courses with curriculum and prerequisites retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}