using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SemesterController(ISemesterService semesterService) : ControllerBase
    {
        [HttpGet("student")]
        public async Task<IActionResult> GetSemestersByStudentAdmission()
        {
            var mssv = User.FindFirstValue(ClaimTypes.Name);
            if (mssv == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            if (string.IsNullOrWhiteSpace(mssv))
            {
                return BadRequest("MSSV query parameter is required.");
            }
            var semesters = await semesterService.GetSemestersByStudentAdmissionAsync(mssv);
            return Ok(semesters);
        }
    }
}
