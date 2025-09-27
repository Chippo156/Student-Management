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
    }
}