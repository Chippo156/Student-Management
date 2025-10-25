using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionController(ISectionService sectionService) : ControllerBase
    {
        [HttpGet("GetAllSections")]
        public async Task<ActionResult<IEnumerable<Section>>> GetAllSections()
        {
            var sections = await sectionService.GetAllSectionsAsync();
            return Ok(ApiResponse.SuccessResponse(sections, "Sections retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Section>> GetSectionById(int id)
        {
            var section = await sectionService.GetSectionByIdAsync(id);
            if (section is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Section with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(section, "Section retrieved successfully"));
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<Section>>> GetSectionsByCourse(int courseId)
        {
            var sections = await sectionService.GetSectionsByCourseAsync(courseId);
            return Ok(ApiResponse.SuccessResponse(sections, "Course sections retrieved successfully"));
        }

        [HttpPost("CreateSection")]
        public async Task<ActionResult<Section>> CreateSection(SectionRequest request)
        {
            var createdSection = await sectionService.CreateSectionAsync(request);
            return CreatedAtAction(nameof(GetSectionById), new { id = createdSection.SectionId }, ApiResponse.SuccessResponse(createdSection, "Section created successfully"));
        }

        [HttpDelete("DeleteSection/{id}")]
        public async Task<ActionResult> DeleteSection(int id)
        {
            var isDeleted = await sectionService.DeleteSectionAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Section with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Section deleted successfully"));
        }

        [HttpGet("lecturer/{lecturerId}")]
        public async Task<ActionResult<IEnumerable<Section>>> GetSectionsByLecturer(int lecturerId)
        {
            var sections = await sectionService.GetSectionsByLecturerAsync(lecturerId);
            return Ok(ApiResponse.SuccessResponse(sections, "Lecturer sections retrieved successfully"));
        }

        [HttpGet("GetSectionsByCurriculumCourseAndSemester/{curriculumCourseId}/{semesterId}")]
        [Authorize]
        public async Task<IActionResult> GetSectionsByCurriculumCourseAndSemester(int curriculumCourseId, int semesterId)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }

            try
            {
                var sections = await sectionService.GetSectionsByCurriculumCourseAndSemesterAsync(curriculumCourseId, semesterId, UserNameStr);
                return Ok(ApiResponse.SuccessResponse(sections, "Sections with registration status retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpGet("GetSectionScheduleWithRegistration/{sectionId}")]
        [Authorize]
        public async Task<IActionResult> GetSectionScheduleWithRegistration(int sectionId)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }

            try
            {
                var schedule = await sectionService.GetSectionScheduleWithRegistrationAsync(sectionId, UserNameStr);
                if (schedule == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Section with ID {sectionId} not found", null));
                }
                return Ok(ApiResponse.SuccessResponse(schedule, "Section schedule with registration status retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
    }
}