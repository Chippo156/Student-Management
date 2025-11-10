using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Extensions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Runtime.InteropServices;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController(IScheduleService scheduleService) : ControllerBase
    {


        [HttpPost("GetAllSchedules")]
        public async Task<IActionResult> GetAllSchedulesWithFilters([FromQuery] ScheduleFilterRequest filterRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid filter parameters", errors));
                }

                var result = await scheduleService.GetAllSchedulesWithFiltersAsync(filterRequest);
                return Ok(ApiResponse.SuccessResponse(result, "Schedules retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving schedules", new List<string> { ex.Message }));
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var schedule = await scheduleService.GetScheduleByIdAsync(id);
            if (schedule is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Schedule with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(schedule, "Schedule retrieved successfully"));
        }

        [HttpPost("CreateScheduleTheory")]
        public async Task<IActionResult> CreateSchedule([FromBody] ScheduleRequest request)
        {
            try {
                var schedule = await scheduleService.CreateScheduleAsync(request);
                return CreatedAtAction(nameof(GetScheduleById), new { id = schedule.ScheduleId },
                    ApiResponse.SuccessResponse(schedule, "Schedule created successfully"));
            }
            catch (Exception ex) {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] ScheduleRequest request)
        {
            try {
                var schedule = await scheduleService.UpdateScheduleAsync(id, request);
                if (schedule is null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Schedule with ID {id} not found", null));
                }
                return Ok(ApiResponse.SuccessResponse(schedule, "Schedule updated successfully"));
            }
            catch (Exception ex) {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var result = await scheduleService.DeleteScheduleAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Schedule with ID {id} not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Schedule deleted successfully"));
        }

        [HttpGet("GetByDate")]
        [Authorize]
        public async Task<IActionResult> GetSchedulesByDate([FromQuery] DateOnly date, [FromQuery] int scheduleTypeId)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            var schedules = await scheduleService.GetSchedulesByDateAndStudentAsync(date, UserNameStr, scheduleTypeId);
            var responseList = schedules.ToResponseList();
            return Ok(ApiResponse.SuccessResponse(responseList, "Schedules retrieved successfully"));
        }

        [HttpGet("countSchedule")]
        [Authorize]
        public
            async Task<IActionResult> countSchedule()
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            var count = await scheduleService.countSchedule(UserNameStr);
            return Ok(ApiResponse.SuccessResponse(count, "Count retrieved successfully"));
        }

        [HttpGet("GetScheduleType")]
        [Authorize]
        public async Task<IActionResult> GetScheduleType()
        {
            var scheduleTypes = await scheduleService.GetAllScheduleType();
            return Ok(ApiResponse.SuccessResponse(scheduleTypes, "Schedule types retrieved successfully"));
        }

        [HttpGet("GetSchedulesOfLecturer")]
        [Authorize]
        public async Task<IActionResult> GetSchedulesOfLecturer([FromQuery] DateOnly date, [FromQuery] int scheduleTypeId)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            var schedules = await scheduleService.GetSchedulesByDateAndLecturerAsync(date, UserNameStr, scheduleTypeId);
            var responseList = schedules.ToResponseList();
            return Ok(ApiResponse.SuccessResponse(responseList, "Schedules retrieved successfully"));
        }

        [HttpGet("countSchedulesOfLecturer")]
        [Authorize]
        public
            async Task<IActionResult> countSchedulesOfLecturer()
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            var count = await scheduleService.CountScheduleByLecturer(UserNameStr);
            return Ok(ApiResponse.SuccessResponse(count, "Count retrieved successfully"));
        }

    }
}