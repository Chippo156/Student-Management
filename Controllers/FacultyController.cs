using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FacultyController(IFacultyService falcutyService) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFacultyById(int id)
        {
            var faculty = await falcutyService.GetFacultyByIdAsync(id);
            if (faculty == null)
            {
                    return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Faculty not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(faculty, "Faculty retrieved successfully"));
        }
        [HttpGet]
        public async Task<IActionResult> GetAllFaculties()
        {
            var faculties = await falcutyService.GetAllFacultiesAsync();
            return Ok(ApiResponse.SuccessResponse(faculties, "Faculties retrieved successfully"));
        }
        [HttpPost]
        public async Task<IActionResult> CreateFaculty([FromBody] Models.Dto.Request.FacultyRequest facultyRequest)
        {
            var faculty = await falcutyService.CreateFacultyAsync(facultyRequest);
            return CreatedAtAction(nameof(GetFacultyById), new { id = faculty.FacultyId }, ApiResponse.SuccessResponse(faculty, "Faculty created successfully"));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFaculty(int id, [FromBody] Models.Dto.Request.FacultyRequest facultyRequest)
        {
            var updatedFaculty = await falcutyService.UpdateFacultyAsync(id, facultyRequest);
            if (updatedFaculty == null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Faculty not found", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedFaculty, "Faculty updated successfully"));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFaculty(int id)
        {
            var result = await falcutyService.DeleteFacultyAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Faculty not found or could not be deleted", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Faculty deleted successfully"));
        }
    }
}
