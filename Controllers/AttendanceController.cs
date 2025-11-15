using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController(IAttendanceService attendanceService) : ControllerBase
    {
        [HttpPost("CreateSession")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> CreateAttendanceSession([FromBody] CreateAttendanceSessionRequest request)
        {
            try
            {
                var lecturerCode = User.FindFirstValue(ClaimTypes.Name);
                if (lecturerCode == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid lecturer code in token.", null));
                }

                var session = await attendanceService.CreateAttendanceSessionAsync(request, lecturerCode);
                return Ok(ApiResponse.SuccessResponse(session, "Attendance session created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("RecordAttendance")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> RecordAttendance([FromBody] RecordAttendanceRequest request)
        {
            try
            {
                var lecturerCode = User.FindFirstValue(ClaimTypes.Name);
                if (lecturerCode == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid lecturer code in token.", null));
                }

                var response = await attendanceService.RecordAttendanceAsync(request, lecturerCode);
                return Ok(ApiResponse.SuccessResponse(response, "Attendance recorded successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("Session/{attendanceSessionId}")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> GetAttendanceSession(int attendanceSessionId)
        {
            try
            {
                var response = await attendanceService.GetAttendanceSessionByIdAsync(attendanceSessionId);
                return Ok(ApiResponse.SuccessResponse(response, "Attendance session retrieved successfully"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, ex.Message, null));
            }
        }

        [HttpGet("MySessions")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> GetMyAttendanceSessions(
            [FromQuery] PaginationParams pagination,
            [FromQuery] int? sectionId = null,
            [FromQuery] int? scheduleTypeId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var lecturerCode = User.FindFirstValue(ClaimTypes.Name);
                if (lecturerCode == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid lecturer code in token.", null));
                }

                var result = await attendanceService.GetAttendanceSessionsByLecturerAsync(
                    lecturerCode, pagination, sectionId, scheduleTypeId, fromDate, toDate);
                
                return Ok(ApiResponse.SuccessResponse(result, "Attendance sessions retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while retrieving attendance sessions", new List<string> { ex.Message }));
            }
        }

        [HttpGet("Student/{studentId}/Section/{sectionId}/Statistics")]
        public async Task<IActionResult> GetStudentAttendanceStatistics(int studentId, int sectionId)
        {
            try
            {
                var statistics = await attendanceService.GetStudentAttendanceStatisticsAsync(studentId, sectionId);
                return Ok(ApiResponse.SuccessResponse(statistics, "Student attendance statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, ex.Message, null));
            }
        }

        [HttpPut("UpdateAttendance/{attendanceId}")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> UpdateAttendance(int attendanceId, [FromBody] UpdateAttendanceRequest request)
        {
            try
            {
                var lecturerCode = User.FindFirstValue(ClaimTypes.Name);
                if (lecturerCode == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid lecturer code in token.", null));
                }

                var result = await attendanceService.UpdateAttendanceAsync(attendanceId, request, lecturerCode);
                if (!result)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Attendance record not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(null, "Attendance updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("Session/{attendanceSessionId}")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> DeleteAttendanceSession(int attendanceSessionId)
        {
            try
            {
                var lecturerCode = User.FindFirstValue(ClaimTypes.Name);
                if (lecturerCode == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid lecturer code in token.", null));
                }

                var result = await attendanceService.DeleteAttendanceSessionAsync(attendanceSessionId, lecturerCode);
                if (!result)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Attendance session not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(null, "Attendance session deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}