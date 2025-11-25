using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Enum;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")] 
    [ApiController]
    public class StudentController(IStudentService studentService) : BaseController
    {
        public static Student student = new Student();

        [HttpGet("GetAllStudents")]
        public async Task<ActionResult<PagedResult<Student>>> GetAllStudents(
    [FromQuery] PaginationParams pagination,
    [FromQuery] string? search = null,
    [FromQuery] string? className = null,
    [FromQuery] int? departmentId = null,
    [FromQuery] int? yearOfAdmission = null,
    [FromQuery] StudentStatus? studentStatus = null)
        {
            try
            {
                var result = await studentService.GetAllStudentsAsync(
                    pagination,
                    search,
                    className,
                    departmentId,
                    yearOfAdmission,
                    studentStatus);

                return Ok(ApiResponse.SuccessResponse(result, "Students retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving students", new List<string> { ex.Message }));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudentById(int id)
        {
            var student = await studentService.GetStudentByIdAsync(id);
            if (student is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Student with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(student, "Student retrieved successfully"));
        }

        [HttpPost("CreateStudent")]
        public async Task<ActionResult<Student>> CreateStudent(StudentRequest student)
        {
            var createdStudent = await studentService.CreateStudentAsync(student);
            if (createdStudent is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Failed to create student.", null));
            }
            return CreatedAtAction(nameof(GetStudentById), new { id = createdStudent.Id }, ApiResponse.SuccessResponse(createdStudent, "Student created successfully"));
        }

        [HttpDelete("DeleteStudent/{id}")]
        public async Task<ActionResult> DeleteStudent(int id)
        {
            var isDeleted = await studentService.DeleteStudentAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Student with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Student deleted successfully"));
        }

        [HttpGet("section/{sectionId}")]
        public async Task<ActionResult<IEnumerable<Student>>> GetStudentsBySection(int sectionId)
        {
            var students = await studentService.GetStudentsBySectionIdAsync(sectionId);
            return Ok(ApiResponse.SuccessResponse(students, "Section students retrieved successfully"));
        }

        [HttpGet("byToken")]
        [Authorize]
        public async Task<ActionResult<Student>> GetStudentByMSSV()
        {
            if (User.Identity is not { IsAuthenticated: true })
            {
                return Unauthorized(ApiResponse.ErrorResponse(ErrorCodes.Unauthorized, "User is not authenticated.", null));
            }
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            var (isValid, errorResult, userId) = GetAuthenticatedUserId();
           
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid user ID in token.", null));
            }
            var student = await studentService.GetStudentByMSSV(UserNameStr);
            if (student is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Student not found for the provided access token.", null));
            }
            return Ok(ApiResponse.SuccessResponse(student, "Student retrieved successfully"));
        }

        [HttpPut("UpdateStudentInformation")]
        [Authorize]
        public async Task<IActionResult> UpdateMyInformation(StudentUpdateRequest request)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }

            try
            {
                var updatedStudent = await studentService.UpdateStudentInformationAsync(UserNameStr, request);
                if (updatedStudent == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Student not found.", null));
                }
                
                return Ok(ApiResponse.SuccessResponse(updatedStudent, "Student information updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("GetStudentsWithSection/{sectionId}")]
        [Authorize(Roles = "Admin,Lecturer")]
        public async Task<ActionResult<IEnumerable<StudentInSectionDto>>> GetStudentsWithSection(
            int sectionId, [FromQuery] PaginationParams paginationParams, string? searchTerm = null)
        {
            var studentsWithSections = await studentService.GetStudentsBySectionWithPaginationAsync(sectionId, paginationParams, searchTerm);
            return Ok(ApiResponse.SuccessResponse(studentsWithSections, "Students with section retrieved successfully"));
        }
    }
}
