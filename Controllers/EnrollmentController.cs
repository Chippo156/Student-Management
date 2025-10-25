using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    public class EnrollmentController(IEnrollmentService enrollmentService) : ControllerBase
    {
        [HttpGet("GetAllEnrollments")]
        public async Task<ActionResult<IEnumerable<Enrollment>>> GetAllEnrollments()
        {
            var enrollments = await enrollmentService.GetAllEnrollmentsAsync();
            return Ok(ApiResponse.SuccessResponse(enrollments, "Enrollments retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Enrollment>> GetEnrollmentById(int id)
        {
            var enrollment = await enrollmentService.GetEnrollmentByIdAsync(id);
            if (enrollment is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Enrollment with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(enrollment, "Enrollment retrieved successfully"));
        }

        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<Enrollment>>> GetEnrollmentsByStudentId(int studentId)
        {
            var enrollments = await enrollmentService.GetEnrollmentsByStudentIdAsync(studentId);
            return Ok(ApiResponse.SuccessResponse(enrollments, "Student enrollments retrieved successfully"));
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<Enrollment>>> GetEnrollmentsByCourseId(int courseId)
        {
            var enrollments = await enrollmentService.GetEnrollmentsByCourseIdAsync(courseId);
            return Ok(ApiResponse.SuccessResponse(enrollments, "Course enrollments retrieved successfully"));
        }

        [HttpPost("CreateEnrollment")]
        public async Task<ActionResult<Enrollment>> CreateEnrollment(EnrollmentRequest enrollmentRequest)
        {
            var createdEnrollment = await enrollmentService.CreateEnrollmentAsync(enrollmentRequest);
            if (createdEnrollment is null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Failed to create enrollment.", null));
            }
            return CreatedAtAction(nameof(GetEnrollmentById), new { id = createdEnrollment.EnrollmentId }, ApiResponse.SuccessResponse(createdEnrollment, "Enrollment created successfully"));
        }

        [HttpDelete("DeleteEnrollment/{id}")]
        public async Task<ActionResult> DeleteEnrollment(int id)
        {
            var isDeleted = await enrollmentService.DeleteEnrollmentAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Enrollment with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Enrollment deleted successfully"));
        }

        [HttpGet("semester/{semesterId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<EnrollmentSemester>>> GetEnrollmentsBySemester(int semesterId)
        {
            var mssv = User.FindFirstValue(ClaimTypes.Name);
            if (mssv == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            var enrollments = await enrollmentService.GetEnrollmentBySemesterAsync(semesterId, mssv);
            return Ok(ApiResponse.SuccessResponse(enrollments, "Enrollments for the semester retrieved successfully"));
        }

        [HttpPost("EnrollInCourse")]
        [Authorize]
        public async Task<IActionResult> EnrollInCourse(CourseEnrollmentRequest request)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }

            try
            {
                var result = await enrollmentService.EnrollInCourseAsync(UserNameStr, request);
                
                if (result.IsSuccess)
                {
                    return Ok(ApiResponse.SuccessResponse(result, result.Message));
                }
                else
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, result.Message, result.Errors));
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}