using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController(ILecturerService lecturerService) : ControllerBase
    {
        [HttpGet("GetAllLecturers")]
        public async Task<ActionResult<IEnumerable<Lecturer>>> GetAllLecturers()
        {
            var lecturers = await lecturerService.GetAllLecturersAsync();
            return Ok(lecturers);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Lecturer>> GetLecturerById(int id)
        {
            var lecturer = await lecturerService.GetLecturerByIdAsync(id);
            if (lecturer is null)
            {
                return NotFound($"Lecturer with ID {id} not found.");
            }
            return Ok(lecturer);
        }
        [HttpPost]
        public async Task<ActionResult<Lecturer>> CreateLecturer(LecturerRequest lecturer)
        {
            var createdLecturer = await lecturerService.CreateLecturerAsync(lecturer);
            if (createdLecturer is null)
            {
                return BadRequest("Failed to create lecturer.");
            }
            return CreatedAtAction(nameof(GetLecturerById), new { id = createdLecturer.Id }, createdLecturer);
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLecturer(int id)
        {
            var isDeleted = await lecturerService.DeleteLecturerAsync(id);
            if (!isDeleted)
            {
                return NotFound($"Lecturer with ID {id} not found.");
            }
            return NoContent();
        }
    }
}
