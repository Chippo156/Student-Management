using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

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


    }
}