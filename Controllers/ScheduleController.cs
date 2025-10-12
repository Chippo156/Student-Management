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
        [HttpGet]
        public async Task<IActionResult> GetAllSchedules()
        {
            var schedules = await scheduleService.GetAllSchedulesAsync();
            return Ok(ApiResponse.SuccessResponse(schedules, "Schedules retrieved successfully"));
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

        [HttpGet("section/{sectionId}")]
        public async Task<IActionResult> GetSchedulesBySection(int sectionId)
        {
            var schedules = await scheduleService.GetSchedulesBySectionAsync(sectionId);
            return Ok(ApiResponse.SuccessResponse(schedules, "Section schedules retrieved successfully"));
        }

        [HttpGet("lecturer/{lecturerId}")]
        public async Task<IActionResult> GetSchedulesByLecturer(int lecturerId)
        {
            var schedules = await scheduleService.GetSchedulesByLecturerAsync(lecturerId);
            return Ok(ApiResponse.SuccessResponse(schedules, "Lecturer schedules retrieved successfully"));
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetSchedulesByStudent(int studentId)
        {
            var schedules = await scheduleService.GetSchedulesByStudentAsync(studentId);
            return Ok(ApiResponse.SuccessResponse(schedules, "Student schedules retrieved successfully"));
        }

        [HttpPost]
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
    }
}