using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/student/attendance")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentAttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public StudentAttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpGet("available-sessions")]
        public async Task<IActionResult> GetAvailableCheckInSessions()
        {
            try
            {
                var mssv = User.FindFirstValue(ClaimTypes.Name);
                if (mssv == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid MSSV in token", null));
                }

                var sessions = await _attendanceService.GetAvailableCheckInSessionsForStudentAsync(mssv);
                return Ok(ApiResponse.SuccessResponse(sessions, "Available check-in sessions retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> SelfCheckIn([FromBody] StudentSelfCheckInRequest request)
        {
            try
            {
                var mssv = User.FindFirstValue(ClaimTypes.Name);
                if (mssv == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid MSSV in token", null));
                }

                var result = await _attendanceService.StudentSelfCheckInAsync(mssv, request);
                
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

        //[HttpGet("my-attendance/{sectionId}")]
        //public async Task<IActionResult> GetMyAttendanceStatistics(int sectionId)
        //{
        //    try
        //    {
        //        var mssv = User.FindFirstValue(ClaimTypes.Name);
        //        if (mssv == null)
        //        {
        //            return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid MSSV in token", null));
        //        }

        //        // Get student ID from MSSV
        //        var student = await _attendanceService.GetStudentByMSSVAsync(mssv);
        //        if (student == null)
        //        {
        //            return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Student not found", null));
        //        }

        //        var statistics = await _attendanceService.GetStudentAttendanceStatisticsAsync(student.Id, sectionId);
        //        return Ok(ApiResponse.SuccessResponse(statistics, "Student attendance statistics retrieved successfully"));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
        //    }
        //}
    }
}