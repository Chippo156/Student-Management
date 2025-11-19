using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Exceptions;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services.Interface;
using System.Security.Claims;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeController(IGradeService gradeService) : ControllerBase
    {
        [HttpGet("GetAllGrades")]

        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<Grade>>> GetGradesByStudent(int studentId)
        {
            var grades = await gradeService.GetGradesByStudentAsync(studentId);
            return Ok(ApiResponse.SuccessResponse(grades, "Student grades retrieved successfully"));
        }

        [HttpGet("assessment/{assessmentId}")]
        public async Task<ActionResult<IEnumerable<Grade>>> GetGradesByAssessment(int assessmentId)
        {
            var grades = await gradeService.GetGradesByAssessmentAsync(assessmentId);
            return Ok(ApiResponse.SuccessResponse(grades, "Assessment grades retrieved successfully"));
        }

        [HttpGet("section/{sectionId}/student/{studentId}")]
        public async Task<ActionResult<IEnumerable<Grade>>> GetGradesBySectionAndStudent(int sectionId, int studentId)
        {
            var grades = await gradeService.GetGradesBySectionAndStudentAsync(sectionId, studentId);
            return Ok(ApiResponse.SuccessResponse(grades, "Section-student grades retrieved successfully"));
        }

        [HttpGet("GetAllStudentGrades/section/{sectionId}")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> GetAllGradesByStudentAndSection(int sectionId)
        {
            try
            {
                var grades = await gradeService.GetAllGradesByStudentAndSectionAsync(sectionId);
                return Ok(ApiResponse.SuccessResponse(grades, "Student section grades retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }

        [HttpPost("CreateGrade")]
        public async Task<ActionResult<Grade>> CreateGrade(GradeRequest request)
        {
            var createdGrade = await gradeService.CreateGradeAsync(request);
            return Ok(ApiResponse.SuccessResponse(createdGrade, "Grade created successfully"));
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult<Grade>> UpdateGrade(int id, GradeRequest request)
        {
            var updatedGrade = await gradeService.UpdateGradeAsync(id, request);
            if (updatedGrade is null)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Grade with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(updatedGrade, "Grade updated successfully"));
        }

        [HttpDelete("DeleteGrade/{id}")]
        public async Task<ActionResult> DeleteGrade(int id)
        {
            var isDeleted = await gradeService.DeleteGradeAsync(id);
            if (!isDeleted)
            {
                return NotFound(ApiResponse.ErrorResponse(ErrorCodes.NotFound, $"Grade with ID {id} not found.", null));
            }
            return Ok(ApiResponse.SuccessResponse(null, "Grade deleted successfully"));
        }

        [HttpGet("semeter/{semeter}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Grade>>> GetStudentSemesterGradesBySections(int semeter)
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }
            var grades = await gradeService.GetStudentSemesterGradesBySectionsAsync(UserNameStr, semeter);
            return Ok(ApiResponse.SuccessResponse(grades, "Semeter-student grades retrieved successfully"));
        }

        [HttpGet("GetMyAllGrades")]
        [Authorize]
        public async Task<IActionResult> GetMyAllGrades()
        {
            var UserNameStr = User.FindFirstValue(ClaimTypes.Name);
            if (UserNameStr == null)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid mssv in token.", null));
            }

            try
            {
                var allGrades = await gradeService.GetAllStudentGradesByMSSVAsync(UserNameStr);
                return Ok(ApiResponse.SuccessResponse(allGrades, "All student grades retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }
        [HttpPost("CreateBulkGrades")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> CreateBulkGrades([FromBody] BulkGradeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, "Invalid request data", errors));
                }

                var result = await gradeService.CreateBulkGradesAsync(request);

                if (result.IsSuccess)
                {
                    return Ok(ApiResponse.SuccessResponse(result, result.Message));
                }
                else
                {
                    return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, result.Message, result.Results));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse(ErrorCodes.InternalServerError,
                    "An error occurred while creating bulk grades", new List<string> { ex.Message }));
            }
        }

        [HttpPost("UpdateAuto/{id}")]
        public async Task<IActionResult> UpdateGradesAuto(int id)
        {
            try
            {
                await gradeService.updateGradeAuto(id);
                return Ok(ApiResponse.SuccessResponse(null, "Grades updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ErrorCodes.BadRequest, ex.Message, null));
            }
        }


    }
}