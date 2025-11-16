using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TuitionController(ITuitionService tuitionService) : ControllerBase
    {
        [HttpGet("GetAllTuitionFee")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTuitionFeesWithPagination([FromQuery] TuitionSearchRequest request)
        {
            try
            {
                var result = await tuitionService.GetTuitionFeesWithPaginationAsync(request);
                return Ok(ApiResponse.SuccessResponse(result, "Tuition fees retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("GetDetailTuitionFee/{tuitionFeeId}")]
        [Authorize]
        public async Task<IActionResult> GetTuitionFeeById(int tuitionFeeId)
        {
            try
            {
                var result = await tuitionService.GetTuitionFeeByIdAsync(tuitionFeeId);
                if (result == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Tuition fee not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(result, "Tuition fee retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("student/{mssv}/summary")]
        [Authorize]
        public async Task<IActionResult> GetStudentTuitionSummary(string mssv)
        {
            try
            {
                // Check if current user can access this data
                var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
                var currentUserName = User.FindFirstValue(ClaimTypes.Name);

                if (currentUserRole != "Admin" && currentUserName != mssv)
                {
                    return Forbid();
                }

                var result = await tuitionService.GetStudentTuitionSummaryAsync(mssv);
                if (result == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Student not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(result, "Student tuition summary retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("generate/{mssv}/semester/{semesterId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GenerateTuitionForStudent(string mssv, int semesterId)
        {
            try
            {
                var result = await tuitionService.GenerateTuitionForStudentAsync(mssv, semesterId);
                return Ok(ApiResponse.SuccessResponse(result, "Tuition fee generated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("generate/semester")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GenerateTuitionForSemester([FromBody] GenerateTuitionRequest request)
        {
            try
            {
                var result = await tuitionService.GenerateTuitionForSemesterAsync(request);
                var message = result ? "Tuition fees generated successfully" : "No tuition fees generated";
                return Ok(ApiResponse.SuccessResponse(result, message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("payment")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var result = await tuitionService.ProcessPaymentAsync(request, currentUserId);
                return Ok(ApiResponse.SuccessResponse(result, "Payment processed successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("overdue")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOverdueTuitionFees()
        {
            try
            {
                var result = await tuitionService.GetOverdueTuitionFeesAsync();
                return Ok(ApiResponse.SuccessResponse(result, "Overdue tuition fees retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}