using Microsoft.AspNetCore.Authorization;
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
    [Authorize(Roles = "Admin")]
    public class AdviserAssignmentController(IAdviserAssignmentService assignmentService) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLecturerFromAdviser(int id)
        {
            var assignments = await assignmentService.GetLecturerByAdviser(id);
            return Ok(ApiResponse.SuccessResponse(assignments, "Lecturer retrieved successfully."));
        }

        [HttpPost("AssignLecturerToClass")]
        public async Task<IActionResult> AssignAdviserToLecturer(int lecturerId, int classId)
        {
            var result = await assignmentService.AssignLecturerToClass(lecturerId, classId);
            if (!result)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.NotFound, "Gán quyền không thành công", null));
            }
            return Ok(ApiResponse.SuccessResponse(result, "Gán quyền thành công"));
        }
    }
}
