using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public StatisticsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// Lấy thống kê tổng quan hệ thống
        /// </summary>
        /// <returns>Thống kê tổng quan bao gồm: số sinh viên, giảng viên, môn học và tỷ lệ qua môn</returns>
        [HttpGet("overview")]
        public async Task<IActionResult> GetStatisticsOverview()
        {
            try
            {
                var statistics = await _reportService.GetStatisticsOverviewAsync();
                return Ok(ApiResponse.SuccessResponse(statistics, "Lấy thống kê tổng quan thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("statistics/student-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStudentStatusStatistics()
        {
            try
            {
                var statistics = await _reportService.GetStudentStatusStatisticsAsync();
                return Ok(ApiResponse.SuccessResponse(statistics, "Thống kê trạng thái sinh viên thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}