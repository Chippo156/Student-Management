using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("student/{studentId}/credits")]
        public async Task<IActionResult> GetStudentCreditStatistics(int studentId)
        {
            try
            {
                var statistics = await _reportService.GetStudentCreditStatisticsAsync(studentId);
                return Ok(ApiResponse.SuccessResponse(statistics, "Student credit statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, ex.Message, null));
            }
        }

        [HttpGet("semester/{semesterId}/credits")]
        [Authorize]
        public async Task<IActionResult> GetStudentSemesterStatistics(int studentId, int semesterId)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            try
            {
                var statistics = await _reportService.GetStudentSemesterStatisticsAsync(UserNameStr, semesterId);
                return Ok(ApiResponse.SuccessResponse(statistics, "Student semester statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, ex.Message, null));
            }
        }
        [HttpGet("student/getAllCreditsByStudent")]
        [Authorize]
        public async Task<IActionResult> GetMyCreditStatistics()
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            try
            {
                var statistics = await _reportService.GetStudentCreditStatisticsByMSSVAsync(UserNameStr);
                return Ok(ApiResponse.SuccessResponse(statistics, "My credit statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, ex.Message, null));
            }
        }

        [HttpGet("students/academic-summary/{semesterId}")]
        [Authorize]
        public async Task<IActionResult> GetStudentAcademicSummary(int semesterId)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            try
            {
                var summary = await _reportService.GetStudentAcademicSummaryAsync(UserNameStr, semesterId);
                return Ok(ApiResponse.SuccessResponse(summary, "Academic summary retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}