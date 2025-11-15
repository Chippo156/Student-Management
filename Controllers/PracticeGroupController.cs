using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PracticeGroupController(IPracticeGroupService practiceGroupService) : ControllerBase
    {
        [HttpPost("CreateSchedulePractice")]
        public async Task<IActionResult> CreatePracticeGroup([FromBody] PracticeGroupRequest request)
        {
            try
            {
                var result = await practiceGroupService.CreatePracticeGroupAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPracticeGroup(int id)
        {
            var result = await practiceGroupService.GetPracticeGroupByIdAsync(id);

            return Ok(ApiResponse.SuccessResponse(result, "Practice group retrieved successfully"));

        }

        [HttpGet("section/{sectionId}")]
        public async Task<IActionResult> GetPracticeGroupsBySection(int sectionId)
        {
            var result = await practiceGroupService.GetPracticeGroupsBySectionAsync(sectionId);
            return Ok(result);
        }

        [HttpPost("{practiceGroupId}/enroll/{studentId}")]
        public async Task<IActionResult> EnrollStudent(int practiceGroupId, int studentId)
        {
            try
            {
                var result = await practiceGroupService.EnrollStudentInPracticeGroupAsync(practiceGroupId, studentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("schedule")]
        public async Task<IActionResult> AddPracticeSchedule([FromBody] PracticeScheduleRequest request)
        {
            try
            {
                var result = await practiceGroupService.AddPracticeScheduleAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("section/{sectionId}/auto-assign")]
        public async Task<IActionResult> AutoAssignStudents(int sectionId)
        {
            try
            {
                var result = await practiceGroupService.AutoAssignStudentsToPracticeGroupsAsync(sectionId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}