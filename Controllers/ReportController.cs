using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;

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

        [HttpGet("student/{studentId}/semester/{semesterId}/credits")]
        public async Task<IActionResult> GetStudentSemesterStatistics(int studentId, int semesterId)
        {
            try
            {
                var statistics = await _reportService.GetStudentSemesterStatisticsAsync(studentId, semesterId);
                return Ok(ApiResponse.SuccessResponse(statistics, "Student semester statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, ex.Message, null));
            }
        }
    }
}