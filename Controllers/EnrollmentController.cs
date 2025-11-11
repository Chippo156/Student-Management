using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Enum;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Runtime.InteropServices;
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

        [HttpGet("semester/{semesterId}/student/GetEnrolledByStudent")]
        public async Task<IActionResult> GetEnrolledSectionsBySemester(int semesterId)
        {
            try
            {
                var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
                if (UserNameStr == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
                }
                var enrolledSections = await enrollmentService.GetEnrolledSectionsBySemesterAsync(UserNameStr, semesterId);
                return Ok(ApiResponse.SuccessResponse(enrolledSections, "Enrolled sections retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("DropEnrollmentStudent")]
        public async Task<IActionResult> DropEnrollment([FromQuery] int sectionId)
        {
            try
            {

                var mssv = User.FindFirstValue(ClaimTypes.Name);
                if (mssv == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
                }
                var result = await enrollmentService.DropEnrollmentAsync(mssv, sectionId);
                
                if (result.IsSuccess)
                {
                    return Ok(ApiResponse.SuccessResponse(result, "Enrollment dropped successfully"));
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

        //[HttpGet("sections/{sectionId}/practice-groups")]
        //public async Task<IActionResult> GetPracticeGroupsForSection(int sectionId)
        //{
        //    try
        //    {
        //        var practiceGroups = await .PracticeGroups
        //            .Include(pg => pg.Schedules)
        //                .ThenInclude(s => s.ScheduleType)
        //            .Where(pg => pg.SectionId == sectionId && pg.IsActive)
        //            .Select(pg => new
        //            {
        //                pg.PracticeGroupId,
        //                pg.GroupName,
        //                pg.Description,
        //                pg.CurrentCount,
        //                pg.MaxCapacity,
        //                IsAvailable = pg.CurrentCount < pg.MaxCapacity,
        //                Schedules = pg.Schedules.Select(s => new
        //                {
        //                    DayOfWeek = s.DayOfWeek.HasValue ? GetDayOfWeekInVietnamese(s.DayOfWeek.Value) : "",
        //                    TimeSlot = $"{s.StartTime:HH:mm} - {s.EndTime:HH:mm}",
        //                    s.Room,
        //                    ScheduleType = s.ScheduleType.Name
        //                }).ToList()
        //            })
        //            .ToListAsync();

        //        return Ok(practiceGroups);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}

        [HttpGet("GetEnrollments")]
        public async Task<IActionResult> GetEnrollmentsWithPagination(
            [FromQuery] PaginationParams pagination,
            [FromQuery] string? search = null,
            [FromQuery] EnrollmentStatus? enrollmentStatus = null,
            [FromQuery] int? semesterId = null)
        {
            try
            {
                var result = await enrollmentService.GetEnrollmentsWithPaginationAsync(
                    pagination, search, enrollmentStatus, semesterId);
                
                return Ok(ApiResponse.SuccessResponse(result, "Enrollments retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while retrieving enrollments", new List<string> { ex.Message }));
            }
        }

        private string GetDayOfWeekInVietnamese(DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
            {
                DayOfWeek.Monday => "Thứ 2",
                DayOfWeek.Tuesday => "Thứ 3",
                DayOfWeek.Wednesday => "Thứ 4", 
                DayOfWeek.Thursday => "Thứ 5",
                DayOfWeek.Friday => "Thứ 6",
                DayOfWeek.Saturday => "Thứ 7",
                DayOfWeek.Sunday => "Chủ nhật",
                _ => ""
            };
        }
    }
}