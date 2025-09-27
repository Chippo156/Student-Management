using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
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
            return Ok(ApiResponse.SuccessResponse(assignments, "Lecturer retrieved successfully."));
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignAdviserToLecturer(int adviserId, int classId)
        {
            var result = await assignmentService.AssignLecturerToClass(adviserId, classId);
            if (!result)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Gán quyền không thành công", null));
            }
            return Ok(ApiResponse.SuccessResponse(result, "Gán quyền thành công"));
        }
    }
}
