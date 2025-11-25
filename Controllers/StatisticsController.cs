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
        [HttpGet("Yearly-growth")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSimpleYearlyGrowth([FromQuery] int years = 7)
        {
            try
            {
                var statistics = await _reportService.GetSimpleYearlyGrowthAsync(years);
                return Ok(ApiResponse.SuccessResponse(statistics, $"Thống kê tăng trưởng {years} năm gần nhất thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
        [HttpGet("student-grades/{mssv}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStudentGradeStatistics(string mssv)
        {
            try
            {
                var statistics = await _reportService.GetStudentGradeStatisticsAsync(mssv);
                return Ok(ApiResponse.SuccessResponse(statistics, "Thống kê điểm số sinh viên thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("all-students-grades")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllStudentsGradeStatistics(
            [FromQuery] int? departmentId = null,
            [FromQuery] int? semesterId = null)
        {
            try
            {
                var statistics = await _reportService.GetAllStudentsGradeStatisticsAsync(departmentId, semesterId);
                return Ok(ApiResponse.SuccessResponse(statistics, "Thống kê điểm số tất cả sinh viên thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
        [HttpGet("graduation-yearly")]
        [Authorize(Roles = "Admin,AcademicStaff")]
        public async Task<IActionResult> GetGraduationYearlyStatistics(
    [FromQuery] int? startYear = null,
    [FromQuery] int? endYear = null)
        {
            try
            {
                var statistics = await _reportService.GetGraduationYearlyStatisticsAsync(startYear, endYear);
                return Ok(ApiResponse.SuccessResponse(statistics, "Thống kê tốt nghiệp hàng năm thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
        [HttpGet("students-by-department")]
        [Authorize(Roles = "Admin,AcademicStaff")]
        public async Task<IActionResult> GetSimpleStudentStatisticsByProgram()
        {
            try
            {
                var statistics = await _reportService.GetSimpleStudentStatisticsByProgramAsync();
                return Ok(ApiResponse.SuccessResponse(statistics, "Lấy thống kê đơn giản sinh viên theo chuyên ngành thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}