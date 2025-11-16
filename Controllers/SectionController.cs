using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Enum;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Models.Dto.Response;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionController(ISectionService sectionService) : ControllerBase
    {
        //[HttpGet("GetAllSections")]
        //public async Task<ActionResult<IEnumerable<Section>>> GetAllSections()
        //{
        //    var sections = await sectionService.GetAllSectionsAsync();
        //    return Ok(ApiResponse.SuccessResponse(sections, "Sections retrieved successfully"));
        //}

        [HttpGet("GetSectionById/{sectionId}")]
        public async Task<ActionResult<SectionListResponse>> GetSectionById(int sectionId)
        {
            var section = await sectionService.GetSectionByIdAsync(sectionId);
            if (section is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Section with ID {sectionId} not found.", null));
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

        [HttpGet("GetAllSection")]
        public async Task<IActionResult> GetSectionsWithPagination(
            [FromQuery] PaginationParams pagination,
            [FromQuery] string? search = null,
            [FromQuery] SectionStatus? status = null,
            [FromQuery] int? semesterId = null)
        {
            try
            {
                var result = await sectionService.GetAllSectionsWithPaginationAsync(
                    pagination, search, status, semesterId);
                
                return Ok(ApiResponse.SuccessResponse(result, "Sections retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while retrieving sections", new List<string> { ex.Message }));
            }
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchSections([FromBody] SectionSearchRequest searchRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid search parameters", errors));
                }

                var result = await sectionService.GetSectionsWithPaginationAsync(searchRequest);
                return Ok(ApiResponse.SuccessResponse(result, "Search completed successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while searching sections", new List<string> { ex.Message }));
            }
        }

        [HttpGet("by-semester/{semesterId}")]
        public async Task<IActionResult> GetSectionsBySemester(
            int semesterId,
            [FromQuery] PaginationParams pagination,
            [FromQuery] string? search = null,
            [FromQuery] SectionStatus? status = null)
        {
            try
            {
                var result = await sectionService.GetAllSectionsWithPaginationAsync(
                    pagination, search, status, semesterId);
                
                return Ok(ApiResponse.SuccessResponse(result, "Sections by semester retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while retrieving sections by semester", new List<string> { ex.Message }));
            }
        }

        [HttpGet("GetSectionsByLecturer")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> GetSectionsSimple([FromQuery] SectionSearchRequest searchRequest)
        {
            try
            {
                var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
                if (UserNameStr == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid Lecturer code in token.", null));
                }
                var result = await sectionService.GetSectionsByLecturerAsync(searchRequest, UserNameStr);
                return Ok(ApiResponse.SuccessResponse(result, "Sections retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError, 
                    "An error occurred while retrieving sections", new List<string> { ex.Message }));
            }
        }

        [HttpGet("GetSectionDropdownForLecturer")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> GetSectionDropdownForLecturer([FromQuery] int? semesterId = null)
        {
            try
            {
                var lecturerCode = User.FindFirstValue(ClaimTypes.Name);
                if (lecturerCode == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid Lecturer code in token.", null));
                }

                var sections = await sectionService.GetSectionDropdownForLecturerAsync(lecturerCode, semesterId);
                return Ok(ApiResponse.SuccessResponse(sections, "Sections dropdown retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving sections dropdown", new List<string> { ex.Message }));
            }
        }
        [HttpGet("GetSectionsIsStartingByLecturer")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> GetSectionsIsStarting()
        {
            try
            {
                var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
                if (UserNameStr == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid Lecturer code in token.", null));
                }
                var result = await sectionService.GetSectionsIsStartingByLecturerAsync(UserNameStr);
                return Ok(ApiResponse.SuccessResponse(result, "Sections retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving sections", new List<string> { ex.Message }));
            }
        }

        [HttpGet("GetSectionTheoryDetail/{sectionId}")]
        [Authorize(Roles = "Admin,Lecturer")]
        public async Task<IActionResult> GetSectionTheoryDetail(int sectionId)
        {
            try
            {
                var result = await sectionService.GetSectionDetailWithScheduleAsync(sectionId, isPracticeSchedule: false);
                
                if (result == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, 
                        $"Section with ID {sectionId} not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(result, "Section theory detail retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving section theory detail", new List<string> { ex.Message }));
            }
        }

        [HttpGet("GetSectionPracticeDetail/{sectionId}")]
        [Authorize(Roles = "Admin,Lecturer")]
        public async Task<IActionResult> GetSectionPracticeDetail(int sectionId, [FromQuery] int? practiceGroupId = null)
        {
            try
            {
                var result = await sectionService.GetSectionDetailWithScheduleAsync(
                    sectionId, 
                    isPracticeSchedule: true, 
                    practiceGroupId: practiceGroupId);
                
                if (result == null)
                {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, 
                        $"Section with ID {sectionId} not found or practice group not found", null));
                }

                return Ok(ApiResponse.SuccessResponse(result, "Section practice detail retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while retrieving section practice detail", new List<string> { ex.Message }));
            }
        }
    }
}