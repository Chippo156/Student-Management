using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Services.Interface;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdviserAssignmentController(IAdviserAssignmentService assignmentService) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLecturerFromAdviser(int id)
        {
            var assignments = await assignmentService.GetLecturerByAdviser(id);
            return Ok(assignments);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignAdviserToLecturer(int adviserId, int classId)
        {
            var result = await assignmentService.AssignLecturerToClass(adviserId, classId);
            if (!result)
            {
                return BadRequest("Assignment failed.");
            }
            return Ok("Assignment successful.");
        }
    }
}
